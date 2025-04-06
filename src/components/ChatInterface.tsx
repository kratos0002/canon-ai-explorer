import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, BookOpen, Library, BookText, Bookmark, Search, MessageSquare, Network } from 'lucide-react';
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
import MindMapView from './MindMapView';

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

export interface Concept {
  id: string;
  label: string;
  description: string;
  connections: string[]; // IDs of connected concepts
}

interface ChatInterfaceProps {
  activeBook: Book | null;
  messages: Message[];
  onSendMessage: (message: string, answerMode: string) => void;
  onBookmarkMessage: (messageId: string) => void;
  glossaryTerms: GlossaryTerm[];
  onAddGlossaryTerm: (term: string, definition: string) => void;
  bookmarks: Message[];
  concepts?: Concept[];
  onAddConcept?: (label: string, description: string) => void;
  onConnectConcepts?: (sourceId: string, targetId: string) => void;
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
  bookmarks,
  concepts = [],
  onAddConcept = () => {},
  onConnectConcepts = () => {},
}) => {
  const [inputValue, setInputValue] = useState('');
  const [answerMode, setAnswerMode] = useState('standard');
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newConceptDescription, setNewConceptDescription] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleAddConcept = () => {
    if (newConcept.trim() && newConceptDescription.trim()) {
      onAddConcept(newConcept.trim(), newConceptDescription.trim());
      setNewConcept('');
      setNewConceptDescription('');
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
      <div className="border-b p-4 bg-white shadow-sm">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-3 text-canon-purple" />
          <div>
            <h2 className="font-serif font-semibold text-xl">{activeBook.title}</h2>
            <p className="text-sm text-muted-foreground">{activeBook.author}, {activeBook.year}</p>
          </div>
        </div>
      </div>

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
            <TabsTrigger value="mindmap" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span>Mind Maps</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden paper-texture">
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
            </div>
            <GuidedQuestions activeBook={activeBook} onUseQuestion={handleUseQuestion} />
          </div>
        </TabsContent>

        <TabsContent value="glossary" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4 paper-texture">
            <div className="flex items-center mb-4">
              <BookText className="h-5 w-5 mr-2 text-canon-purple" />
              <h2 className="font-serif text-xl">Glossary</h2>
            </div>
            
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

        <TabsContent value="mindmap" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-4 paper-texture">
            <div className="flex items-center mb-4">
              <Network className="h-5 w-5 mr-2 text-canon-purple" />
              <h2 className="font-serif text-xl">Mind Maps</h2>
            </div>
            
            <div className="bg-white p-4 rounded-lg mb-6 shadow-sm border border-canon-beige-dark/20">
              <h3 className="font-medium mb-3 font-serif">Add New Concept</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Concept Name"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={newConceptDescription}
                  onChange={(e) => setNewConceptDescription(e.target.value)}
                />
                <Button onClick={handleAddConcept} className="w-full btn-hover-effect">Add to Mind Map</Button>
              </div>
            </div>
            
            {concepts.length > 0 ? (
              <div className="bg-white/80 rounded-lg p-4 min-h-[400px] shadow-sm">
                <MindMapView concepts={concepts} onConnectConcepts={onConnectConcepts} />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-white/70 rounded-lg shadow-sm">
                <Network className="h-12 w-12 empty-state-decoration" />
                <p>No concepts yet. Add your first concept above to start building a mind map.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatInterface;
