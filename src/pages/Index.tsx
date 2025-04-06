
import React, { useState } from 'react';
import BookSidebar, { Book } from '@/components/BookSidebar';
import ChatInterface, { Message, GlossaryTerm } from '@/components/ChatInterface';
import SettingsPanel from '@/components/SettingsPanel';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Sample book data
const sampleBooks: Book[] = [
  {
    id: 'communist-manifesto',
    title: 'The Communist Manifesto',
    author: 'Karl Marx & Friedrich Engels',
    year: '1848',
    cover: '/communist-manifesto-cover.jpg'
  },
  {
    id: 'wealth-of-nations',
    title: 'The Wealth of Nations',
    author: 'Adam Smith',
    year: '1776',
    cover: '/wealth-of-nations-cover.jpg'
  }
];

// Mock API call for sending messages
const mockSendMessage = async (bookId: string, message: string, answerMode: string): Promise<Message> => {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would make an API call to your backend
  const responses: Record<string, string> = {
    'communist-manifesto': "According to Marx and Engels in The Communist Manifesto, class struggle is the driving force of historical development. The authors argue that society has always been divided between oppressor and oppressed classes, with the modern era characterized by the conflict between the bourgeoisie (capitalist class) and the proletariat (working class).",
    'wealth-of-nations': "In The Wealth of Nations, Adam Smith introduces the concept of the 'invisible hand' - the idea that individuals pursuing their own self-interest in a free market economy promote the welfare of society as a whole, even though this is not their intention."
  };
  
  const citations = [
    {
      id: uuidv4(),
      text: "The history of all hitherto existing society is the history of class struggles.",
      source: bookId === 'communist-manifesto' ? "The Communist Manifesto" : "The Wealth of Nations",
      page: bookId === 'communist-manifesto' ? "14" : "25"
    }
  ];
  
  return {
    id: uuidv4(),
    type: 'assistant',
    content: responses[bookId] || "I can provide insights about this book based on its content.",
    timestamp: new Date(),
    citations: citations,
    bookmarked: false
  };
};

const Index: React.FC = () => {
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [glossaryTerms, setGlossaryTerms] = useState<Record<string, GlossaryTerm[]>>({});
  const [bookmarks, setBookmarks] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activeBook = activeBookId ? sampleBooks.find(book => book.id === activeBookId) || null : null;
  const activeMessages = activeBookId ? messages[activeBookId] || [] : [];
  const activeGlossaryTerms = activeBookId ? glossaryTerms[activeBookId] || [] : [];

  const handleSelectBook = (bookId: string) => {
    setActiveBookId(bookId);
    
    // Initialize book data if needed
    if (!messages[bookId]) {
      setMessages(prev => ({ ...prev, [bookId]: [] }));
    }
    
    if (!glossaryTerms[bookId]) {
      setGlossaryTerms(prev => ({ ...prev, [bookId]: [] }));
    }
  };

  const handleSendMessage = async (message: string, answerMode: string) => {
    if (!activeBookId) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => ({
      ...prev,
      [activeBookId]: [...(prev[activeBookId] || []), userMessage]
    }));
    
    // Show loading toast
    setIsLoading(true);
    
    try {
      // Get AI response (mock)
      const response = await mockSendMessage(activeBookId, message, answerMode);
      
      // Add AI response to messages
      setMessages(prev => ({
        ...prev,
        [activeBookId]: [...(prev[activeBookId] || []), response]
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkMessage = (messageId: string) => {
    if (!activeBookId) return;
    
    // Update message bookmarked status
    setMessages(prev => {
      const updatedMessages = prev[activeBookId]?.map(msg => {
        if (msg.id === messageId) {
          const newBookmarkStatus = !msg.bookmarked;
          
          // Update bookmarks collection
          if (newBookmarkStatus) {
            setBookmarks(prevBookmarks => [...prevBookmarks, {...msg, bookmarked: true}]);
          } else {
            setBookmarks(prevBookmarks => prevBookmarks.filter(bm => bm.id !== messageId));
          }
          
          return { ...msg, bookmarked: newBookmarkStatus };
        }
        return msg;
      });
      
      return { ...prev, [activeBookId]: updatedMessages || [] };
    });
  };

  const handleAddGlossaryTerm = (term: string, definition: string) => {
    if (!activeBookId) return;
    
    const newTerm: GlossaryTerm = {
      id: uuidv4(),
      term,
      definition
    };
    
    setGlossaryTerms(prev => ({
      ...prev,
      [activeBookId]: [...(prev[activeBookId] || []), newTerm]
    }));
    
    toast({
      title: "Term Added",
      description: `"${term}" has been added to the glossary.`
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <BookSidebar
        books={sampleBooks}
        activeBookId={activeBookId}
        onSelectBook={handleSelectBook}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      
      <ChatInterface
        activeBook={activeBook}
        messages={activeMessages}
        onSendMessage={handleSendMessage}
        onBookmarkMessage={handleBookmarkMessage}
        glossaryTerms={activeGlossaryTerms}
        onAddGlossaryTerm={handleAddGlossaryTerm}
        bookmarks={bookmarks}
      />
      
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
