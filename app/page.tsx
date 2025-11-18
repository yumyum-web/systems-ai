'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  IconButton,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './components/Mermaid';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const drawerWidth = 280;

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', title: 'New Chat', messages: [] },
  ]);
  const [currentChatId, setCurrentChatId] = useState('1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    // Add user message to current chat
    const updatedChats = chats.map((chat) =>
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    );
    setChats(updatedChats);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...(currentChat?.messages || []), userMessage],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      // Add assistant message
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            const updatedMessages = [...chat.messages, assistantMessage];
            // Update chat title with first user message if it's still "New Chat"
            const title =
              chat.title === 'New Chat' && updatedMessages.length > 0
                ? updatedMessages[0].content.slice(0, 50) + '...'
                : chat.title;
            return { ...chat, messages: updatedMessages, title };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure your API key is configured correctly.',
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setMobileOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Systems AI
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={handleNewChat}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            justifyContent: 'flex-start',
            px: 2,
            py: 1,
            width: '100%',
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          <Typography>New Chat</Typography>
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {chats.map((chat) => (
          <ListItem key={chat.id} disablePadding>
            <ListItemButton
              selected={chat.id === currentChatId}
              onClick={() => {
                setCurrentChatId(chat.id);
                setMobileOpen(false);
              }}
            >
              <ListItemText
                primary={chat.title}
                primaryTypographyProps={{
                  noWrap: true,
                  style: { fontSize: '0.9rem' },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            display: { sm: 'none' },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Systems AI
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Toolbar sx={{ display: { sm: 'none' } }} />

          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 3,
              pb: 2,
            }}
          >
            <Container maxWidth="md">
              {currentChat?.messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h3" gutterBottom>
                    Systems AI
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get expert advice on system architecture and design
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ask me anything about distributed systems, microservices, databases, and more!
                  </Typography>
                </Box>
              ) : (
                <>
                  {currentChat?.messages.map((message, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor:
                          message.role === 'user'
                            ? 'primary.dark'
                            : 'background.paper',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {message.role === 'user' ? 'You' : 'Systems AI'}
                      </Typography>
                      <Box
                        sx={{
                          '& p': { mb: 1 },
                          '& pre': {
                            bgcolor: 'background.default',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            my: 1,
                          },
                          '& code': {
                            bgcolor: 'background.default',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontFamily: 'monospace',
                          },
                          '& pre code': {
                            bgcolor: 'transparent',
                            p: 0,
                          },
                          '& ul, & ol': {
                            pl: 2,
                            mb: 1,
                          },
                          '& li': {
                            mb: 0.5,
                          },
                          '& h1, & h2, & h3, & h4, & h5, & h6': {
                            mt: 2,
                            mb: 1,
                            fontWeight: 600,
                          },
                          '& blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            pl: 2,
                            py: 0.5,
                            my: 1,
                            fontStyle: 'italic',
                          },
                          '& a': {
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          },
                          '& table': {
                            width: '100%',
                            borderCollapse: 'collapse',
                            my: 2,
                            overflow: 'auto',
                            display: 'block',
                          },
                          '& thead': {
                            bgcolor: 'action.hover',
                          },
                          '& th': {
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 1.5,
                            textAlign: 'left',
                            fontWeight: 600,
                          },
                          '& td': {
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 1.5,
                          },
                          '& tr:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code(props) {
                              const { children, className, ...rest } = props;
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';
                              const codeString = String(children).replace(/\n$/, '');
                              const isInline = !className;

                              if (!isInline && language === 'mermaid') {
                                return <Mermaid chart={codeString} />;
                              }

                              return (
                                <code className={className} {...rest}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </Box>
                    </Paper>
                  ))}
                  {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Container>
          </Box>

          <Box
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              p: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Container maxWidth="md">
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask about system architecture, design patterns, best practices..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  variant="outlined"
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'background.paper',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
