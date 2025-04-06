
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Book } from './BookSidebar';

interface GuidedQuestionsProps {
  activeBook: Book;
  onUseQuestion: (question: string) => void;
}

interface QuestionCategory {
  id: string;
  title: string;
  questions: string[];
}

// Sample questions - in a real application, these would come from the backend
const getQuestionsForBook = (bookId: string): QuestionCategory[] => {
  const commonQuestions = [
    {
      id: 'key-concepts',
      title: 'Key Concepts',
      questions: [
        'What are the main ideas in this book?',
        'What is the author\'s central argument?',
        'How does the author define success?'
      ]
    },
    {
      id: 'political-theory',
      title: 'Political Theory',
      questions: [
        'What form of government does the author advocate for?',
        'What is the author\'s view on political representation?',
        'How does the author view the relationship between citizens and the state?'
      ]
    }
  ];
  
  const bookSpecificQuestions = {
    'communist-manifesto': [
      {
        id: 'class-analysis',
        title: 'Class Analysis',
        questions: [
          'How does Marx define social class?',
          'What is the bourgeoisie according to Marx?',
          'How does the proletariat emerge according to Marx?',
          'What is class consciousness?'
        ]
      },
      {
        id: 'economic-analysis',
        title: 'Economic Analysis',
        questions: [
          'How does Marx view capitalism?',
          'What economic contradictions does Marx identify in capitalism?',
          'How does Marx explain economic crises?'
        ]
      }
    ],
    'wealth-of-nations': [
      {
        id: 'economic-analysis',
        title: 'Economic Analysis',
        questions: [
          'What is the invisible hand according to Smith?',
          'How does Smith view the division of labor?',
          'What are Smith\'s views on free markets?',
          'How does Smith explain economic growth?'
        ]
      },
      {
        id: 'role-of-government',
        title: 'Role of Government',
        questions: [
          'What duties does Smith assign to government?',
          'What is Smith\'s view on taxation?',
          'How does Smith view government regulation?'
        ]
      }
    ]
  };
  
  // Return combined questions
  return [
    ...commonQuestions,
    ...(bookSpecificQuestions[bookId as keyof typeof bookSpecificQuestions] || [])
  ];
};

const GuidedQuestions: React.FC<GuidedQuestionsProps> = ({ activeBook, onUseQuestion }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  const questionCategories = getQuestionsForBook(activeBook.id);
  
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className={cn(
      "border-l transition-all duration-300 bg-white flex flex-col",
      collapsed ? "w-[40px]" : "w-[280px]"
    )}>
      {/* Header */}
      <div className="border-b p-3 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-0 h-6 w-6", collapsed && "rotate-180")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <h3 className="ml-2 font-medium">Guided Questions</h3>
        )}
      </div>
      
      {/* Questions list */}
      {!collapsed && (
        <ScrollArea className="flex-1">
          <div className="p-3">
            {questionCategories.map((category) => (
              <Collapsible 
                key={category.id}
                open={openCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
                className="mb-3"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between font-medium text-left"
                  >
                    {category.title}
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      openCategories.includes(category.id) && "rotate-90"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-2 mt-1 border-l-2 border-canon-beige-dark">
                    {category.questions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        className="w-full justify-start py-1.5 h-auto text-left"
                        onClick={() => onUseQuestion(question)}
                      >
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default GuidedQuestions;
