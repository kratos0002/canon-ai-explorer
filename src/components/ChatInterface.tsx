
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book } from './BookSidebar';
import GuidedQuestions from './GuidedQuestions';
import { cn } from '@/lib/utils';
import { BookmarkIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  bookmarked?: boolean;
}

export interface Citation {
  id: string;
  text: string;
  source: string;
  page: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

interface ChatInterfaceProps {
  activeBook: Book | null;
  messages: Message[];
  onSendMessage: (message: string, answerMode: string) => void;
  onBookmarkMessage: (messageId: string) => void;
  glossaryTerms: GlossaryTerm[];
  onAddGlossaryTerm: (term: string, definition: string) => void;
  bookmarks: Message[];
}

const AnswerModes = [
  { value: 'standard', label: 'Standard' },
  { value: 'eli5', label: 'ELI5' },
  { value: 'scholar', label: 'Scholar' },
  { value: 'compare', label: 'Compare Books' }
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeBook,
  messages,
  onSendMessage,
  onBookmarkMessage,
  glossaryTerms,
  onAddGlossaryTerm,
  bookmarks
}) => {
  const [inputValue, setInputValue] = useState('');
  const [answerMode, setAnswerMode] = useState('standard');
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), answerMode);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddGlossaryTerm = () => {
    if (newTerm.trim() && newDefinition.trim()) {
      onAddGlossaryTerm(newTerm.trim(), newDefinition.trim());
      setNewTerm('');
      setNewDefinition('');
    }
  };

  const handleUseQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!activeBook) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canon-beige/30">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-serif mb-2">Welcome to Ask the Canon</h2>
          <p className="text-muted-foreground mb-4">Select a book from the library to start exploring classic texts through AI-powered conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="font-serif font-semibold text-xl">{activeBook.title}</h2>
        <p className="text-sm text-muted-foreground">{activeBook.author}, {activeBook.year}</p>
      </div>

      {/* Main content area with tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="glossary">Glossary</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
          <div className="flex flex-1 overflow-hidden">
            {/* Main chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 chat-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="font-serif text-lg mb-2">Start a conversation about {activeBook.title}</h3>
                    <p className="text-muted-foreground mb-4">Ask a question or use the guided questions panel to explore this text.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={cn(
                        message.type === 'user' ? 'message-user' : 'message-assistant'
                      )}>
                        <div className="flex justify-between items-start">
                          <span className="font-medium">
                            {message.type === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          {message.type === 'assistant' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onBookmarkMessage(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <BookmarkIcon className={cn(
                                "h-4 w-4", 
                                message.bookmarked ? "fill-canon-purple text-canon-purple" : "text-muted-foreground"
                              )} />
                            </Button>
                          )}
                        </div>
                        <div className="mt-1">{message.content}</div>
                        
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-2">
                            {message.citations.map((citation, index) => (
                              <div key={citation.id} className="citation">
                                <span className="font-medium">[{index + 1}]</span> {citation.source}, p. {citation.page}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Input area */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-2 items-center mb-2">
                  <label htmlFor="answer-mode" className="text-sm font-medium whitespace-nowrap">Answer mode:</label>
                  <Select value={answerMode} onValueChange={setAnswerMode}>
                    <SelectTrigger id="answer-mode" className="w-[140px]">
                      <SelectValue placeholder="Standard" />
                    </SelectTrigger>
                    <SelectContent>
                      {AnswerModes.map(mode => (
                        <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder={`Ask about ${activeBook.title}...`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Guided Questions Sidebar */}
            <GuidedQuestions activeBook={activeBook} onUseQuestion={handleUseQuestion} />
          </div>
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4">
            <h2 className="font-serif text-xl mb-4">Glossary</h2>
            
            {/* Add new term form */}
            <div className="bg-canon-beige p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Add New Term</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Term"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                />
                <Input
                  placeholder="Definition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                />
                <Button onClick={handleAddGlossaryTerm}>Add to Glossary</Button>
              </div>
            </div>
            
            {/* Glossary terms list */}
            {glossaryTerms.length > 0 ? (
              <div className="space-y-4">
                {glossaryTerms.map((item) => (
                  <div key={item.id} className="border-b pb-3">
                    <h4 className="font-medium">{item.term}</h4>
                    <p className="text-muted-foreground">{item.definition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No glossary terms yet. Add your first term above.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4">
            <h2 className="font-serif text-xl mb-4">Bookmarks</h2>
            
            {bookmarks.length > 0 ? (
              <div className="space-y-4">
                {bookmarks.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        {message.timestamp.toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBookmarkMessage(message.id)}
                        className="h-6 w-6 p-0"
                      >
                        <BookmarkIcon className="h-4 w-4 fill-canon-purple text-canon-purple" />
                      </Button>
                    </div>
                    <div className="mt-2">{message.content}</div>
                    
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2">
                        {message.citations.map((citation, index) => (
                          <div key={citation.id} className="citation">
                            <span className="font-medium">[{index + 1}]</span> {citation.source}, p. {citation.page}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No bookmarks yet. Bookmark important responses in your conversations.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatInterface;
