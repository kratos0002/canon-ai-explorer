
import React, { useState } from 'react';
import { ChevronLeft, Book, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
        "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[280px]"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-xl font-serif font-bold">Ask the Canon</h1>}
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
          {!collapsed && <h2 className="text-sm font-medium text-sidebar-foreground mb-2">Library</h2>}
          <ul className="space-y-1">
            {books.map((book) => (
              <li key={book.id}>
                <Button
                  variant={activeBookId === book.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3",
                    activeBookId === book.id && "bg-canon-beige text-canon-purple-dark"
                  )}
                  onClick={() => onSelectBook(book.id)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {!collapsed && (
                    <span className="truncate">
                      {book.title}
                      <span className="block text-xs text-muted-foreground">{book.author}, {book.year}</span>
                    </span>
                  )}
                </Button>
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
