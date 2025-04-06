
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, BookOpen, Library, BookText, Bookmark, Search, MessageSquare } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center bg-canon-beige/30 paper-texture">
        <Library className="h-20 w-20 text-canon-purple/25 mb-6" />
        <div className="text-center max-w-md p-6 bg-white/80 rounded-lg shadow-sm">
          <h2 className="text-2xl font-serif mb-2">Welcome to Ask the Canon</h2>
          <p className="text-muted-foreground mb-4">Select a book from the library to start exploring classic texts through AI-powered conversations.</p>
          <div className="flex justify-center space-x-2 opacity-30">
            <BookText className="h-5 w-5" />
            <MessageSquare className="h-5 w-5" />
            <Search className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 bg-white shadow-sm">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-3 text-canon-purple" />
          <div>
            <h2 className="font-serif font-semibold text-xl">{activeBook.title}</h2>
            <p className="text-sm text-muted-foreground">{activeBook.author}, {activeBook.year}</p>
          </div>
        </div>
      </div>

      {/* Main content area with tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4 bg-white">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="glossary" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              <span>Glossary</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Bookmarks</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
          <div className="flex flex-1 overflow-hidden">
            {/* Main chat area */}
            <div className="flex-1 flex flex-col overflow-hidden paper-texture">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 chat-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <BookOpen className="h-16 w-16 empty-state-decoration" />
                    <h3 className="font-serif text-lg mb-2">Start a conversation about {activeBook.title}</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">Ask questions to explore the text or use the guided questions panel to dive deeper into key concepts.</p>
                    <div className="max-w-sm mx-auto bg-white/60 p-3 rounded-lg border border-canon-beige-dark/30">
                      <p className="text-sm italic text-muted-foreground">"The history of all hitherto existing society is the history of class struggles."</p>
                      <p className="text-xs text-right mt-2 text-canon-purple">— Opening line, Chapter 1</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={cn(
                        message.type === 'user' ? 'message-user' : 'message-assistant'
                      )}>
                        <div className="flex justify-between items-start">
                          <span className="font-medium flex items-center gap-2">
                            {message.type === 'user' ? 'You' : (
                              <>
                                <BookText className="h-4 w-4 text-canon-purple" />
                                <span>AI Assistant</span>
                              </>
                            )}
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
                        <div className="mt-2 leading-relaxed">{message.content}</div>
                        
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-3 space-y-2">
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
                  <Button onClick={handleSendMessage} className="btn-hover-effect">
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
          <div className="p-4 paper-texture">
            <div className="flex items-center mb-4">
              <BookText className="h-5 w-5 mr-2 text-canon-purple" />
              <h2 className="font-serif text-xl">Glossary</h2>
            </div>
            
            {/* Add new term form */}
            <div className="bg-white p-4 rounded-lg mb-6 shadow-sm border border-canon-beige-dark/20">
              <h3 className="font-medium mb-3 font-serif">Add New Term</h3>
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
                <Button onClick={handleAddGlossaryTerm} className="w-full btn-hover-effect">Add to Glossary</Button>
              </div>
            </div>
            
            {/* Glossary terms list */}
            {glossaryTerms.length > 0 ? (
              <div className="space-y-1 bg-white/80 rounded-lg p-2">
                {glossaryTerms.map((item) => (
                  <div key={item.id} className="glossary-term">
                    <h4 className="font-medium font-serif">{item.term}</h4>
                    <p className="text-muted-foreground mt-1">{item.definition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-white/70 rounded-lg shadow-sm">
                <BookText className="h-12 w-12 empty-state-decoration" />
                <p>No glossary terms yet. Add your first term above.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4 paper-texture">
            <div className="flex items-center mb-4">
              <Bookmark className="h-5 w-5 mr-2 text-canon-purple" />
              <h2 className="font-serif text-xl">Bookmarks</h2>
            </div>
            
            {bookmarks.length > 0 ? (
              <div className="space-y-4">
                {bookmarks.map((message) => (
                  <div key={message.id} className="bg-white border rounded-lg p-4 shadow-sm">
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
                    <div className="mt-2 leading-relaxed">{message.content}</div>
                    
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 space-y-2">
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
              <div className="text-center py-8 text-muted-foreground bg-white/70 rounded-lg shadow-sm">
                <Bookmark className="h-12 w-12 empty-state-decoration" />
                <p>No bookmarks yet. Bookmark important responses in your conversations.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatInterface;
