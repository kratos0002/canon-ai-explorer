
import React, { useState } from 'react';
import { ChevronLeft, Book, BookOpen, Settings, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year: string;
}

interface BookSidebarProps {
  books: Book[];
  activeBookId: string | null;
  onSelectBook: (bookId: string) => void;
  onOpenSettings: () => void;
}

const BookSidebar: React.FC<BookSidebarProps> = ({
  books,
  activeBookId,
  onSelectBook,
  onOpenSettings
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 paper-texture",
        collapsed ? "w-[60px]" : "w-[280px]"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center">
            <Library className="h-5 w-5 mr-2 text-canon-purple" />
            <h1 className="text-xl font-serif font-bold">Ask the Canon</h1>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-auto p-3">
        <div className={cn("mb-2", !collapsed && "px-2")}>
          {!collapsed && (
            <div className="flex items-center mb-4">
              <h2 className="text-sm font-medium text-sidebar-foreground">Library</h2>
              <div className="ml-2 h-px flex-1 bg-sidebar-border"></div>
            </div>
          )}
          
          <ul className="space-y-3">
            {books.map((book) => (
              <li key={book.id}>
                {collapsed ? (
                  <Button
                    variant={activeBookId === book.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-center",
                      collapsed ? "px-2" : "px-3",
                      activeBookId === book.id && "bg-canon-beige text-canon-purple-dark"
                    )}
                    onClick={() => onSelectBook(book.id)}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                ) : (
                  <div 
                    className={cn(
                      "rounded-lg overflow-hidden transition-all cursor-pointer",
                      activeBookId === book.id && "ring-2 ring-canon-purple"
                    )}
                    onClick={() => onSelectBook(book.id)}
                  >
                    <div className="flex gap-3 p-2 hover:bg-sidebar-accent rounded-lg">
                      {book.cover && (
                        <div className="w-14 h-20 flex-shrink-0">
                          <div className="book-cover w-full h-full">
                            <img 
                              src={book.cover} 
                              alt={`Cover of ${book.title}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-medium text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}, {book.year}</p>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <Separator />
      
      <div className="p-3">
        <Button
          variant="ghost"
          className={cn("w-full justify-start", collapsed ? "px-2" : "px-3")}
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          {!collapsed && <span>Settings</span>}
        </Button>
      </div>
    </div>
  );
};

export default BookSidebar;
