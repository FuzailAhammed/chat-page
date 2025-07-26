import { useState, useRef, useEffect } from 'react';
import { Send, FileText, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  citations?: Array<{ page: number; text: string }>;
  timestamp: Date;
}

interface ChatInterfaceProps {
  fileName?: string;
  onPageNavigate?: (page: number) => void;
}

export function ChatInterface({ fileName, onPageNavigate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when document is loaded
  useEffect(() => {
    if (fileName && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Your document is ready! You can now ask questions about your document. For example:\n\n• "What is the main topic of this document?"\n• "Can you summarize the key points?"\n• "What are the conclusions or recommendations?"`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [fileName, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(userMessage.content),
        sender: 'ai',
        citations: [
          { page: 1, text: 'Page 1' },
          { page: 3, text: 'Page 3' }
        ],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (question: string) => {
    // Simplified response generation (replace with actual AI integration)
    if (question.toLowerCase().includes('skills')) {
      return 'The candidate is familiar with a variety of tools. For web development, they use React, Angular, Node.js, and Next.js. They have experience with RESTful APIs, database optimization, and deploying web applications. They are also proficient with cloud platforms such as AWS and Azure.';
    }
    return 'Based on the document content, I can provide insights about the topics you\'re asking about. The document contains detailed information that I can analyze and explain.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-background">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-border bg-card">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Your document is ready!</h3>
          {fileName && (
            <p className="text-sm text-muted-foreground">{fileName}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.sender === 'user'
                  ? "bg-chat-message-user text-white"
                  : "bg-chat-message-ai text-foreground"
              )}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {message.citations && message.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.citations.map((citation, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onPageNavigate?.(citation.page)}
                    >
                      {citation.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-chat-message-ai rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the document..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}