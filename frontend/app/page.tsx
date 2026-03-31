"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useStore } from "@/lib/store"
import ChatInput from "@/components/chat-input"
import ChatMessage from "@/components/chat-message"
import Sidebar from "@/components/sidebar"
import { Trash2, BookOpen, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// Custom SidebarIcon component
const SidebarIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5"
  >
    {/* Outer rounded rectangle */}
    <path 
      d="M6 5 L15 5 A3 3 0 0 1 18 8 L18 16 A3 3 0 0 1 15 19 L6 19 A3 3 0 0 1 3 16 L3 8 A3 3 0 0 1 6 5 Z" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Vertical divider */}
    <path 
      d="M9 5 V 19" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Left panel indicators (pill-shaped) */}
    <path 
      d="M5.5 8.5 H 6.5" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M5.5 11.5 H 6.5" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

export default function Home() {
  const { messages, activeChat, clearChat, isSidebarOpen, toggleSidebar, isGenerating, loadChats, createNewChat } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { toast } = useToast()
  const [hasScrolledUp, setHasScrolledUp] = useState(false)
  const lastMessageIdRef = useRef<string | null>(null)

  // Load chats on initial page load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await loadChats();
        // The loadChats function in the store already handles
        // setting the last active chat or the most recent chat
        // No need to create a new chat here
      } catch (error) {
        console.error("Error loading chats in page component:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadChats]);

  // Ensure we display the welcome screen when there's no active chat
  useEffect(() => {
    // Force re-render when activeChat changes to null
    if (activeChat === null) {
      // This ensures the welcome screen is rendered
      // and the input is properly initialized
      window.requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      });
    }
  }, [activeChat]);

  // Scroll to bottom when messages change, only if user is at bottom
  useEffect(() => {
    if (isUserAtBottom && chatContainerRef.current) {
      // Check if the last message is from the assistant (only auto-scroll on assistant messages)
      const lastMessage = messages[messages.length - 1];
      const isLastMessageFromAssistant = lastMessage && (lastMessage.role === "assistant" || lastMessage.role === "model");
      
      if (isLastMessageFromAssistant) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isUserAtBottom]);

  // Handler to check if user is at (or near) the bottom
  const handleScroll = () => {
    const container = chatContainerRef.current
    if (!container) return
    const threshold = 50 // px
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    setIsUserAtBottom(isAtBottom)
    // If user scrolls up significantly, consider it a manual scroll up
    if (!isAtBottom && container.scrollTop < container.scrollHeight - container.clientHeight - 100) {
      setHasScrolledUp(true);
    } else {
      setHasScrolledUp(false);
    }
  }

  // Reset hasScrolledUp when at bottom
  useEffect(() => {
    if (isUserAtBottom) {
      setHasScrolledUp(false);
    }
  }, [isUserAtBottom]);

  // Handler to scroll to bottom when button is clicked
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Function to ensure user messages are positioned at the top
  const positionUserMessageAtTop = () => {
    const userMessageElements = document.querySelectorAll('[data-message-id]');
    if (!userMessageElements.length || !chatContainerRef.current) return;
    
    // Find the newest user message (typically the last one added)
    const userMessages = Array.from(userMessageElements).filter(el => 
      el.closest('.justify-end') !== null  // User messages have justify-end class on their parent
    );
    
    if (userMessages.length === 0) return;
    
    // Get the newest user message (the last one in the DOM)
    const newestUserMessage = userMessages[userMessages.length - 1];
    const messageId = newestUserMessage.getAttribute('data-message-id');
    
    // Only scroll if this is a new message (not one we've already handled)
    if (messageId && messageId !== lastMessageIdRef.current) {
      console.log("Positioning user message at top:", messageId);
      lastMessageIdRef.current = messageId;
      
      // Calculate position to scroll to
      const topOffset = 80; // Account for header and padding
      const containerRect = chatContainerRef.current.getBoundingClientRect();
      const messageRect = newestUserMessage.getBoundingClientRect();
      
      // Calculate scroll position
      const scrollPosition = messageRect.top - containerRect.top - topOffset + chatContainerRef.current.scrollTop;
      
      // Apply the scroll - force immediate position first
      chatContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'auto'
      });
      
      // Then smooth scroll for visual appeal
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      });
      
      // Update state to indicate we're not at the bottom
      setIsUserAtBottom(false);
      setHasScrolledUp(true);
    }
  };
  
  // Watch for changes to messages array
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Check if the most recent message is from the user
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      // If it's a user message, force it to the top
      setTimeout(positionUserMessageAtTop, 50); // Short delay to allow for DOM update
    }
  }, [messages.length]);

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Header - now positioned absolute/fixed over the content with transparent background */}
        <header className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-background/0 dark:bg-background/0 pr-4",
          isSidebarOpen ? "pl-2" : "pl-4",
          "h-16" // Consistent height regardless of sidebar state
        )}>
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleSidebar}
                      className="mr-3 h-8 w-8 rounded-full border border-input bg-background/90 dark:bg-background/90 hover:bg-muted"
                      aria-label="Open sidebar"
                    >
                      <SidebarIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-background">
  
  <div className="flex items-center justify-center w-15 h-15">
    <Image
      src="/mathgenius-logo.png"
      alt="MathGenius AI"
      width={35}
      height={35}
    />
  </div>

  <h1 className="text-lg font-semibold tracking-tight">
    MathGenius AI
  </h1>

</div>

          </div>
          <div className="flex items-center gap-2 rounded-full px-2 bg-background/90 dark:bg-background/90">
            <ModeToggle />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowClearDialog(true)}
                    disabled={messages.length === 0 || isGenerating}
                    aria-label="Clear chat"
                    className="h-8 w-8 rounded-full border border-input bg-background/90 dark:bg-background/90 hover:bg-muted"
                  >
                    <Trash2 size={24} className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Chat messages container - now starts from the top of window but with padding */}
        <div
          className={cn(
            "flex-1 overflow-y-auto md:p-6 px-4 pt-4",
            "pt-20 pb-24", // Consistent top padding regardless of sidebar state
            "chat-container-height" // Added CSS class instead of inline style
          )}
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-start">
              {/* Grouped main content: logo, text, input bar - above center */}
              <div className="flex flex-col items-center w-full max-w-3xl pt-14">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-10 w-10" />
                </div>
                <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">Ask me anything about math!</h2>
                <p className="mb-6 max-w-md text-center text-muted-foreground">
                  I can help with equations, theorems, calculus, algebra, and more. Try asking a question below.
                </p>
                <div className="w-full">
                  <ChatInput />
                </div>
              </div>
              
              {/* Example cards moved to the bottom */}
              <div className="absolute bottom-10 left-0 right-0 px-4">
                <div className="mx-auto max-w-5xl grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <ExampleCard
                    title="Solve Equations"
                    description="Solve quadratic, cubic, or systems of equations step-by-step"
                    example="Solve x^2 - 5x + 6 = 0"
                  />
                  <ExampleCard
                    title="Calculate Derivatives"
                    description="Find derivatives of functions with detailed explanations"
                    example="What is the derivative of sin(x^2)?"
                  />
                  <ExampleCard
                    title="Explain Concepts"
                    description="Get clear explanations of mathematical concepts"
                    example="Explain the Pythagorean theorem"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button - always above input bar, flex centered */}
        {/* NEW absolutely positioned Button Container - transparent by default */}
        {!isUserAtBottom && !isLoading && messages.length > 0 && hasScrolledUp && (
          <div
            className={cn(
              "fixed bottom-[120px] z-20 flex justify-center",
              isDesktop && isSidebarOpen 
                ? "left-[calc(50%+144px)] -translate-x-1/2" // Desktop with sidebar open
                : "left-1/2 -translate-x-1/2" // Default centered position (mobile or sidebar closed)
            )}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 pointer-events-auto rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition hover:bg-primary/50 focus:outline-none focus-visible:ring-5 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Input area - only show when there are messages */}
        {messages.length > 0 && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-transparent flex justify-center px-4 py-3">
            <div className="w-full max-w-3xl">
              <ChatInput />
            </div>
          </div>
        )}
      </div>

      {/* Clear chat confirmation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear current chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the current chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  // Delete the current chat without creating a new one first
                  await clearChat();
                  setShowClearDialog(false);
                  toast({
                    title: "Chat Cleared",
                    description: "The current conversation has been cleared.",
                    variant: "success",
                    duration: 2000,
                  });
                  // Force focus to render the welcome state properly
                  window.requestAnimationFrame(() => {
                    document.body.focus();
                  });
                } catch (error) {
                  console.error("Error clearing chat:", error);
                  toast({
                    title: "Error",
                    description: "Failed to clear chat. Please try again.",
                    variant: "destructive",
                  });
                  setShowClearDialog(false);
                }
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

function ExampleCard({ title, description, example }: { title: string; description: string; example: string }) {
  const { messages } = useStore()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    // Only add the example if there are no messages yet
    if (messages.length === 0) {
      const textarea = document.querySelector("textarea")
      if (textarea) {
        // Set the value and dispatch an input event to trigger any listeners
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        )?.set
        if (nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(textarea, example)
          textarea.dispatchEvent(new Event("input", { bubbles: true }))
          textarea.focus()
        }
      }
    }
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col rounded-3xl border bg-accent dark:bg-accent p-4 transition-all duration-200",
        isHovered && "border-primary shadow-md",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-auto rounded-2xl border bg-background dark:bg-background p-2 text-sm font-mono">{example}</div>
    </div>
  )
}
