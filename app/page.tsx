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
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './components/Mermaid';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7',
    },
    secondary: {
      main: '#ba68c8',
    },
    background: {
      default: '#0a0e27',
      paper: '#131a35',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
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
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0f1629 0%, #0a0e27 100%)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'center',gap: 1.5, py: 4 }}>
        <AccountTreeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}>
          Systems AI
        </Typography>
      </Toolbar>
      <Divider sx={{ opacity: 0.1 }} />
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={handleNewChat}
          sx={{
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            justifyContent: 'flex-start',
            px: 2.5,
            py: 1.5,
            width: '100%',
            bgcolor: 'primary.main',
            color: 'background.paper',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(79, 195, 247, 0.3)',
            },
            transition: 'all 0.2s',
          }}
        >
          <AddIcon sx={{ mr: 1.5, fontSize: 22 }} />
          <Typography fontWeight={600}>New Chat</Typography>
        </IconButton>
      </Box>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
        {chats.map((chat) => (
          <ListItem key={chat.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={chat.id === currentChatId}
              onClick={() => {
                setCurrentChatId(chat.id);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(79, 195, 247, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(79, 195, 247, 0.2)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ChatIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
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
              display: currentChat?.messages.length === 0 ? 'flex' : 'block',
              alignItems: currentChat?.messages.length === 0 ? 'center' : 'flex-start',
            }}
          >
            <Container maxWidth="md" sx={{ width: '100%' }}>
              {currentChat?.messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 3,
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <AccountTreeIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  </Box>
                  <Typography 
                    variant="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #4fc3f7 0%, #ba68c8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    Systems AI
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
                    Get expert advice on system architecture and design
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                      'Distributed Systems',
                      'Microservices',
                      'Database Design',
                      'API Architecture',
                    ].map((topic) => (
                      <Paper
                        key={topic}
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: 'rgba(79, 195, 247, 0.1)',
                          border: '1px solid',
                          borderColor: 'rgba(79, 195, 247, 0.3)',
                        }}
                      >
                        <Typography variant="body2" color="primary.light">
                          {topic}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              ) : (
                <>
                  {currentChat?.messages.map((message, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 3,
                        mb: 2,
                        bgcolor:
                          message.role === 'user'
                            ? 'rgba(79, 195, 247, 0.08)'
                            : 'background.paper',
                        border: '1px solid',
                        borderColor: 
                          message.role === 'user'
                            ? 'rgba(79, 195, 247, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 
                            message.role === 'user'
                              ? 'rgba(79, 195, 247, 0.4)'
                              : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        {message.role === 'user' ? (
                          <PersonIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                        ) : (
                          <SmartToyIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
                        )}
                        <Typography
                          variant="subtitle1"
                          sx={{ 
                            fontWeight: 600,
                            color: message.role === 'user' ? 'primary.main' : 'secondary.main',
                          }}
                        >
                          {message.role === 'user' ? 'You' : 'Systems AI'}
                        </Typography>
                      </Box>
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
                          '& ul': {
                            listStyleType: 'disc',
                            listStylePosition: 'outside',
                            pl: 4,
                            mb: 1,
                            ml: 2,
                          },
                          '& ol': {
                            listStyleType: 'decimal',
                            listStylePosition: 'outside',
                            pl: 4,
                            mb: 1,
                            ml: 2,
                          },
                          '& li': {
                            mb: 0.5,
                            display: 'list-item',
                          },
                          '& ul ul': {
                            listStyleType: 'circle',
                            mt: 0.5,
                          },
                          '& ul ul ul': {
                            listStyleType: 'square',
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
              borderTop: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              p: 3,
              bgcolor: 'background.default',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Container maxWidth="md">
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      borderRadius: 3,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'background.paper',
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(79, 195, 247, 0.4)',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(79, 195, 247, 0.5)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.2s',
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
