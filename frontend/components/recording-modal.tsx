"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, StopCircle, X } from "lucide-react"
import { useStore } from "@/lib/store"
import { speechToText } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import SpeechRecognition from "react-speech-recognition"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RecordingModalProps {
  open: boolean
  onClose: () => void
  transcript: string
  onRecordingFinalized: (blob: Blob) => void
}

export function RecordingModal({
  open,
  onClose,
  transcript,
  onRecordingFinalized,
}: RecordingModalProps) {
  const { toast } = useToast()
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const audioChunks = useRef<Blob[]>([])
  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null)
  const micStream = useRef<MediaStream | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null)
  // Add a cancellation flag to track when recording is cancelled
  const isCancelled = useRef<boolean>(false)
  const micButtonRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping Mic button
  const stopButtonRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping StopCircle button
  const consecutiveZeroReadings = useRef<number>(0); // Ref to track consecutive zero readings
  
  // Handle cleanup when component unmounts or modal closes
  useEffect(() => {
    if (!open) {
      cleanupRecording(true) // Clean up with cancellation when modal closes
    }
    
    return () => {
      cleanupRecording(true) // Clean up with cancellation on unmount
    }
  }, [open])
  
  // Handle keyboard events for the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if (e.key === "Escape") {
        // ESC key pressed - cancel recording and close modal
        cancelRecording()
      } else if (e.key === "Enter") {
        // ENTER key pressed
        // Check if the focused element is one of our buttons before acting
        if (document.activeElement === micButtonRef.current?.querySelector('svg') && !isRecording) {
          startRecording();
        } else if (document.activeElement === stopButtonRef.current?.querySelector('svg') && isRecording) {
          stopRecording();
        } else if (!isRecording) {
          // If no specific button is focused and not recording, default to start
          startRecording(); 
        }
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, isRecording])
  
  // Effect to focus the appropriate button
  useEffect(() => {
    if (open) {
      setTimeout(() => { // Timeout to ensure modal and elements are rendered
        if (isRecording) {
          stopButtonRef.current?.querySelector('svg')?.focus();
        } else {
          micButtonRef.current?.querySelector('svg')?.focus();
        }
      }, 100); // Small delay might be needed for focus to take effect after render
    }
  }, [open, isRecording]);
  
  // Clean up all recording resources
  const cleanupRecording = (cancelled = false) => {
    // Set cancellation flag if specified
    if (cancelled) {
      isCancelled.current = true
    }
    
    // Stop media recorder if running
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
    }
    
    // Clear timer intervals
    if (timerInterval.current) {
      clearInterval(timerInterval.current)
      timerInterval.current = null
    }
    
    if (silenceTimeout.current) {
      clearTimeout(silenceTimeout.current)
      silenceTimeout.current = null
    }
    
    // Clean up audio context
    if (microphone.current) {
      microphone.current.disconnect()
      microphone.current = null
    }
    
    if (analyser.current) {
      analyser.current.disconnect()
      analyser.current = null
    }
    
    if (audioContext.current) {
      if (audioContext.current.state !== 'closed') {
        audioContext.current.close()
      }
      audioContext.current = null
    }
    
    // Stop and release mic stream
    if (micStream.current) {
      micStream.current.getTracks().forEach(track => track.stop())
      micStream.current = null
    }
    
    // Stop speech recognition if we're cancelling
    if (cancelled) {
      SpeechRecognition.stopListening()
    }
    
    // Reset state
    setMediaRecorder(null)
    setIsRecording(false)
    setElapsedTime(0)
    consecutiveZeroReadings.current = 0
    
    // Clear audio chunks if cancelled
    if (cancelled) {
      audioChunks.current = []
    }
  }
  
  // Reset the silence detection timer (call this when sound is detected)
  const resetSilenceTimer = () => {
    // Clear existing timer
    if (silenceTimeout.current) {
      clearTimeout(silenceTimeout.current)
    }
    
    // Set new 10-second timer
    silenceTimeout.current = setTimeout(() => {
      toast({
        title: "Recording stopped",
        description: "No speech detected for 10 seconds.",
        variant: "default",
        duration: 3000, // Shorter duration for toast
      })
      
      if (mediaRecorder && mediaRecorder.state === "recording") {
        // Don't process this recording - mark as cancelled
        isCancelled.current = true
        mediaRecorder.stop()
        cleanupRecording(true)
        onClose()
      }
    }, 10000) // 10 seconds
  }
  
  // Set up audio analysis to detect silence or muted mic
  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      // Check if Web Audio API is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.error("Web Audio API not supported in this browser")
        return
      }
      
      // Create audio context
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyser.current = audioContext.current.createAnalyser()
      microphone.current = audioContext.current.createMediaStreamSource(stream)
      
      // Connect the analyzer
      microphone.current.connect(analyser.current)
      
      // Configure analyzer
      analyser.current.fftSize = 256 // Smaller size for faster processing
      analyser.current.smoothingTimeConstant = 0.3
      
      // Set up periodic checks for audio activity
      const checkInterval = setInterval(() => {
        if (!isRecording || !analyser.current) {
          clearInterval(checkInterval)
          return
        }
        
        // Get audio data
        const bufferLength = analyser.current.frequencyBinCount
        const frequencyData = new Uint8Array(bufferLength)
        analyser.current.getByteFrequencyData(frequencyData)
        
        // Check for audio activity
        let sum = 0
        let maxValue = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += frequencyData[i]
          maxValue = Math.max(maxValue, frequencyData[i])
        }
        
        const average = sum / bufferLength
        
        // Detect sound above threshold
        if (average > 0.5 || maxValue > 2) {
          // Reset silence timer when sound is detected
          resetSilenceTimer()
        }
        
        // Check if microphone is muted (all zeros pattern)
        // Instead of showing a toast on the first detection, count consecutive zero readings
        // This helps prevent false positive mute detection when there's just momentary silence
        if (average === 0 && maxValue === 0) {
          // Increment counter for consecutive zero readings
          consecutiveZeroReadings.current = (consecutiveZeroReadings.current || 0) + 1;
          
          // Only show muted notification after multiple consecutive zero readings (3 seconds)
          if (consecutiveZeroReadings.current >= 3) {
            toast({
              title: "Microphone appears to be muted",
              description: "Your microphone appears to be muted. Please unmute it.",
              variant: "destructive",
              duration: 3000, // Shorter duration for toast
            })
            
            // Reset counter to avoid showing the toast repeatedly
            consecutiveZeroReadings.current = 0;
          }
        } else {
          // Reset consecutive zero readings counter when non-zero audio detected
          consecutiveZeroReadings.current = 0;
        }
      }, 1000) // Check every second
      
      // Initial silence timeout
      resetSilenceTimer()
      
      return () => {
        clearInterval(checkInterval)
      }
    } catch (error) {
      console.error("Error setting up audio analysis:", error)
    }
  }
  
  // Start recording when user clicks the mic button in the modal
  const startRecording = async () => {
    try {
      
      // Reset cancellation flag
      isCancelled.current = false
      
      // Start speech recognition for real-time transcript
      SpeechRecognition.startListening({ continuous: true })
      
      // Get audio stream for recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStream.current = stream
      
      // Set up the audio analysis for silence detection
      setupAudioAnalysis(stream)
      
      // Set up media recorder
      const recorder = new MediaRecorder(stream)
      audioChunks.current = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        
        // Only process if we have audio chunks AND this isn't a cancellation
        if (audioChunks.current.length > 0 && !isCancelled.current) {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
                    
          // Only finalize if not cancelled
          onRecordingFinalized(audioBlob)
        } 
      }
      
      // Start recording
      recorder.start(1000) // Collect data every second
      setMediaRecorder(recorder)
      setIsRecording(true)
      
      // Start elapsed time counter
      timerInterval.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error("Error starting recording:", error)
      
      let errorMessage = "Please ensure you've granted permission to use the microphone."
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Microphone access was denied. Please enable microphone permission in your browser settings."
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please ensure your microphone is properly connected."
        } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
          errorMessage = "Your microphone is busy or not responding. Please close other applications that might be using it."
        }
      }
      
      toast({
        title: "Microphone access failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000, // Shorter duration for toast
      })
      
      onClose()
    }
  }
  
  // Stop recording and process audio
  const stopRecording = () => {
    
    // 1. Clear any pending silence timeout that might set isCancelled.current = true
    if (silenceTimeout.current) {
      clearTimeout(silenceTimeout.current);
      silenceTimeout.current = null;
    }

    // 2. Explicitly set isCancelled.current to false for a normal stop operation.
    //    This ensures that recorder.onstop processes the audio.
    isCancelled.current = false;

    if (mediaRecorder && mediaRecorder.state === "recording") {
      SpeechRecognition.stopListening(); // Stop this first to capture latest transcript parts
      mediaRecorder.stop(); // This will asynchronously trigger recorder.onstop
    } else {
      // This case implies the stop button was clicked when not actively recording.
      // Treat as a cancellation/close action.
      cleanupRecording(true); // Perform a full cancellation cleanup
      onClose(); // Close the modal
      return;
    }

    // 3. Update UI state related to active recording
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setIsRecording(false);
    // Note: setElapsedTime(0) is handled by cleanupRecording, which will be called eventually when the modal closes.

    // Flow:
    // - mediaRecorder.stop() triggers recorder.onstop().
    // - recorder.onstop() checks isCancelled.current (now false) and audioChunks.
    // - If chunks exist, it calls onRecordingFinalized(audioBlob).
    // - The component calling RecordingModal (ChatInput) implements onRecordingFinalized.
    //   This implementation will typically:
    //     a. Send the blob for Speech-to-Text.
    //     b. On STT success, update its own input state with the transcript.
    //     c. Call onClose() for the RecordingModal.
    // - When onClose() is called, the useEffect for `open` in RecordingModal triggers `cleanupRecording(true)`,
    //   which performs the final resource cleanup.
  };
  
  // Cancel recording without processing
  const cancelRecording = () => {
    // Full cleanup with cancellation
    cleanupRecording(true)
    onClose()
  }
  
  // Format elapsed time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Patch: Delay focus return after modal closes to avoid aria-hidden warning
  const handleModalClose = () => {
    setTimeout(() => {
      onClose();
    }, 50); // Delay to ensure aria-hidden is removed
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isRecording ? "Recording in progress" : "Voice Input"}</DialogTitle>
          <DialogDescription>
            {isRecording 
              ? "Recording is in progress. Speak clearly into your microphone." 
              : "Press the mic icon to start recording..."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          {isRecording && <div className="mb-4 text-4xl font-mono">{formatTime(elapsedTime)}</div>}
          <div className="flex items-center justify-center gap-8 mb-6">
            {isRecording ? (
              <>
                <div ref={stopButtonRef} className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center" tabIndex={-1}>
                  <StopCircle
                    className="h-10 w-10 text-primary cursor-pointer animate-pulse focus:outline-none focus:ring-0 focus:ring-primary rounded-full"
                    onClick={stopRecording}
                    tabIndex={0} // Make SVG focusable
                  />
                </div>
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X
                    className="h-10 w-10 text-destructive cursor-pointer animate-pulse focus:outline-none focus:ring-0 focus:ring-destructive rounded-full"
                    onClick={cancelRecording}
                    tabIndex={0} // Make SVG focusable
                  />
                </div>
              </>
            ) : (
              <div ref={micButtonRef} className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center" tabIndex={-1}>
                <Mic 
                  className="h-10 w-10 text-primary cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary rounded-full" 
                  onClick={startRecording}
                  tabIndex={0} // Make SVG focusable
                />
              </div>
            )}
          </div>
          {/* Only show transcript when recording is active */}
          {isRecording && transcript && (
            <div className="mt-4 w-full px-4 py-3 rounded-md bg-muted">
              <p className="text-sm italic">{transcript}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
