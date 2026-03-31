"use client"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { X, Edit2, Trash2, BookOpen, History, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// Custom NewChatIcon component
const NewChatIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5"
  >
    <path 
      d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M16.04 3.02001L8.16 10.9C7.86 11.2 7.56 11.79 7.5 12.22L7.07 15.23C6.91 16.32 7.68 17.08 8.77 16.93L11.78 16.5C12.2 16.44 12.79 16.14 13.1 15.84L20.98 7.96001C22.34 6.60001 22.98 5.02001 20.98 3.02001C18.98 1.02001 17.4 1.66001 16.04 3.02001Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeMiterlimit="10" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M14.91 4.1499C15.58 6.5399 17.45 8.4099 19.85 9.0899" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeMiterlimit="10" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

// Custom SidebarIcon component
const SidebarIcon = () => {
  return (
    <Image
      src="/mathgenius-logo.png"
      alt="MathGenius AI"
      width={20}
      height={20}
      className="rounded-md"
    />
  )
}


export default function Sidebar() {
  const {
    chats,
    activeChat,
    setActiveChat,
    createNewChat,
    renameChat,
    deleteChat,
    isSidebarOpen,
    toggleSidebar,
    loadChats,
  } = useStore()
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { toast } = useToast()

  // Load chat sessions when the sidebar is mounted
  useEffect(() => {
    let mounted = true;
    
    const initializeChats = async () => {
      try {
        await loadChats();
        
        // Only create a new chat if specifically requested,
        // not automatically on mount or reload
        // The loadChats function in the store handles setting 
        // the active chat from local storage or the most recent chat
      } catch (error) {
        console.error("Failed to load chats:", error);
        
        // Only attempt to create a new chat if loading failed AND we're still mounted
        if (mounted) {
          try {
            await createNewChat();
            toast({
              title: "Created New Chat",
              description: "Couldn't load existing chats, so we've created a new one for you.",
              variant: "default",
            });
          } catch (createError) {
            console.error("Failed to create fallback chat:", createError);
            toast({
              title: "Error",
              description: "Failed to load or create chats. Please refresh the page.",
              variant: "destructive",
            });
          }
        }
      }
    };
    
    initializeChats();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
    
  }, [loadChats, createNewChat, toast]);

  const handleNewChat = async () => {
    try {
      await createNewChat()
      setIsRenaming(null)
      if (!isDesktop && isSidebarOpen) {
        toggleSidebar()
      }
      toast({
        title: "New Chat Created",
        description: "Started a new conversation.",
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTitleClick = async () => {
    try {
      // Set to initial status page: no active chat, clear messages
      await setActiveChat(null);
      setIsRenaming(null);
      if (!isDesktop && isSidebarOpen) {
        toggleSidebar();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not navigate to home. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (chatId === activeChat) {
      if (!isDesktop) {
        toggleSidebar()
      }
      return;
    }

    try {
      await setActiveChat(chatId)
      if (!isDesktop) {
        toggleSidebar()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRenameSubmit = async (e: React.FormEvent, chatId: string, newName: string) => {
    e.preventDefault()
    if (newName.trim() === "") return
    
    try {
      await renameChat(chatId, newName.trim())
      setIsRenaming(null)
      toast({
        title: "Chat Renamed",
        description: "The chat has been renamed successfully.",
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      setChatToDelete(null)
      // Close sidebar on mobile if open
      if (!isDesktop && isSidebarOpen) {
        toggleSidebar()
      }
      toast({
        title: "Chat Deleted",
        description: "The chat has been deleted successfully.",
        variant: "success",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    // First ensure chats are unique by ID
    const uniqueChatsMap = new Map();
    chats.forEach(chat => {
      uniqueChatsMap.set(chat.id, chat);
    });
    
    // Convert map back to array
    const uniqueChats = Array.from(uniqueChatsMap.values());
    
    // Filter by search query if needed
    if (searchQuery.trim() === "") {
      return uniqueChats;
    } else {
      return uniqueChats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [chats, searchQuery]);

  // CONDITIONAL RENDERING FOR CLOSED SIDEBAR STATE
  if (!isSidebarOpen) {
    return (
      <div className="fixed top-0 left-0 h-16 flex items-center justify-between bg-background px-4 z-50">
        <div className="flex items-center">
          {/* Sidebar Toggle Button (to OPEN) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full mr-3"
                  onClick={toggleSidebar}
                  aria-label="Open sidebar"
                >
                  <span className="inline-flex items-center justify-center transform scale-[2.1]">
                    <SidebarIcon />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* New Chat Icon Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full mr-3"
                  onClick={handleNewChat}
                  aria-label="New Chat"
                >
                  <span className="inline-flex items-center justify-center transform scale-[1.5]">
                    <NewChatIcon />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Image
  src="/mathgenius-logo.png"
  alt="MathGenius AI"
  width={24}
  height={24}
  className="rounded-md"
 />



                  {/* App Title */}
        <button
          onClick={handleTitleClick}
          className="text-xl font-bold ml-3 text-left text-primary hover:opacity-80"
          aria-label="Return to home"
        >
          MathGenuis AI
        </button>
        </div>
        <div></div>
      </div>
    );
  }

  // EXISTING RETURN FOR OPEN SIDEBAR STATE
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={toggleSidebar}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r backdrop-blur-md transition-transform duration-300 ease-in-out md:relative md:z-0",
          "dark:bg-black dark:backdrop-blur-none",
          !isSidebarOpen && "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">

            {!isDesktop && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full mr-2 md:hidden"
                      onClick={toggleSidebar}
                      aria-label="Close sidebar"
                    >
                      <span className="inline-flex items-center justify-center transform scale-[2.1]">
                        <X className="h-4 w-4" />
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isDesktop && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full mr-2"
                      onClick={toggleSidebar}
                      aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                      <span className="inline-flex items-center justify-center transform scale-[2.1]">
                        <SidebarIcon />
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSidebarOpen ? "Close sidebar" : "Open sidebar"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setIsSearchActive(!isSearchActive)}
                  >
                    <span className="inline-flex items-center justify-center transform scale-[1.5]">
                      <Search strokeWidth={2} className="h-4 w-4" />
                    </span>
                    <span className="sr-only">Search Chats</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search chats</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleNewChat}
                  >
                    <span className="inline-flex items-center justify-center transform scale-[1.5]">
                      <NewChatIcon />
                    </span>   
                    <span className="sr-only">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3">
          <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
            <History className="h-4 w-4" />
            <span>Chat History</span>
          </div>

          {/* Search Input - Only shown when search is active */}
          {isSearchActive && (
            <div className="mb-2 px-2 py-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
          )}

          <div className={cn(
            "mt-2 space-y-1",
            filteredChats.length > 11 && "sidebar-chat-scrollbar sidebar-chat-scrollable"
          )}>
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
                <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{searchQuery ? "No matching chats" : "No chat history yet"}</p>
                <p className="text-xs text-muted-foreground">{searchQuery ? "Try a different search term" : "Start a new conversation to see it here"}</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div key={chat.id} className="relative">
                  {isRenaming === chat.id ? (
                    <div className="flex items-center gap-1 rounded-md border p-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Chat name"
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSubmit(e, chat.id, newName)
                          } else if (e.key === "Escape") {
                            setIsRenaming(null)
                            setNewName("")
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleRenameSubmit(e, chat.id, newName)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex items-center justify-between rounded-md px-2 py-2 transition-colors",
                        activeChat === chat.id ? "bg-primary/15 text-primary" : "hover:bg-primary/10 dark:hover:bg-muted/80",
                      )}
                    >
                      <button
                        className="w-full overflow-hidden text-left"
                        onClick={() => {
                          if (chat.id) {
                            handleSelectChat(chat.id)
                          }
                        }}
                      >
                        <span className="line-clamp-1">{chat.name}</span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              setIsRenaming(chat.id)
                              setNewName(chat.name)
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setChatToDelete(chat.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Delete chat confirmation dialog */}
      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (chatToDelete) {
                  handleDeleteChat(chatToDelete)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
