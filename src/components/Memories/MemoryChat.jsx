import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  Input,
  IconButton,
  HStack,
  Text,
  useColorModeValue,
  Avatar,
  Spinner,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  generateMemoryResponse,
  saveMemoryChat,
  getMemoryChatHistory,
} from '../../services/memoryChat';

const Message = ({ content, isUser, timestamp, currentUser }) => {
  const userBg = useColorModeValue('blue.500', 'blue.400');
  const aiBg = useColorModeValue('gray.100', 'gray.700');
  const aiColor = useColorModeValue('gray.800', 'white');

  return (
    <Flex justify={isUser ? 'flex-end' : 'flex-start'} mb={2} w="100%">
      {!isUser && (
        <Avatar size="sm" name="Memory AI" src="/memory-ai-avatar.png" mr={2} />
      )}
      <Box
        maxW="80%"
        bg={isUser ? userBg : aiBg}
        color={isUser ? 'white' : aiColor}
        px={4}
        py={2}
        borderRadius="lg"
        borderBottomRightRadius={isUser ? '4px' : 'lg'}
        borderBottomLeftRadius={isUser ? 'lg' : '4px'}
      >
        <Text>{content}</Text>
        <Text fontSize="xs" color={isUser ? 'whiteAlpha.800' : 'gray.500'} mt={1}>
          {new Date(timestamp).toLocaleTimeString()}
        </Text>
      </Box>
      {isUser && (
        <Avatar
          size="sm"
          name={currentUser?.displayName}
          src={currentUser?.photoURL}
          ml={2}
        />
      )}
    </Flex>
  );
};

const MemoryChat = ({ memory }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const chatBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const loadingBg = useColorModeValue('gray.100', 'gray.700');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = {
      content: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateMemoryResponse(memory, messages, input);
      const aiMessage = {
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      await saveMemoryChat(memory.id, currentUser.uid, updatedMessages);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: 'Error generating response',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, memory, messages, currentUser, toast]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!currentUser || !memory) return;
      
      try {
        const history = await getMemoryChatHistory(memory.id, currentUser.uid);
        if (history.length > 0) {
          setMessages(history);
        } else {
          const context = [
            memory.caption,
            memory.analysis?.scene,
            memory.analysis?.mainElements,
            memory.analysis?.mood,
            memory.tags?.join(', ')
          ].filter(Boolean).join(' ');

          const initialMessage = {
            content: `I see this photo from ${memory.yearsAgo} years ago! Would you like to tell me more about this ${context}? What makes this memory special to you?`,
            isUser: false,
            timestamp: new Date().toISOString()
          };

          setMessages([initialMessage]);
          await saveMemoryChat(memory.id, currentUser.uid, [initialMessage]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast({
          title: 'Error loading chat history',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadChatHistory();
  }, [currentUser, memory, toast]);

  const userBg = useMemo(() => useColorModeValue('blue.500', 'blue.400'), []);
  const aiBg = useMemo(() => useColorModeValue('gray.100', 'gray.700'), []);
  const aiColor = useMemo(() => useColorModeValue('gray.800', 'white'), []);

  return (
    <Box
      bg={chatBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      h="400px"
      display="flex"
      flexDirection="column"
    >
      <VStack
        flex="1"
        overflowY="auto"
        p={4}
        spacing={4}
        align="stretch"
      >
        {messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            currentUser={currentUser}
          />
        ))}
        {isLoading && (
          <Flex justify="flex-start" w="100%">
            <Box
              bg={loadingBg}
              p={4}
              borderRadius="lg"
            >
              <Spinner size="sm" />
            </Box>
          </Flex>
        )}
        <div ref={messagesEndRef} />
      </VStack>

      <HStack p={4} borderTopWidth="1px" borderColor={borderColor}>
        <Input
          placeholder="Share your thoughts about this memory..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          icon={<FiSend />}
          onClick={handleSend}
          isLoading={isLoading}
          colorScheme="blue"
        />
      </HStack>
    </Box>
  );
};

export default MemoryChat;
