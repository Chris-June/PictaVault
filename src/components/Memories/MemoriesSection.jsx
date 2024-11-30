import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  Skeleton,
  VStack,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import { getOnThisDayMemories } from '../../services/memories';
import MemoriesCard from './MemoriesCard';
import { useAuth } from '../../context/AuthContext';

const MemoriesSection = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        if (currentUser) {
          const memoriesData = await getOnThisDayMemories(currentUser.uid);
          setMemories(memoriesData);
        }
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [currentUser]);

  if (loading) {
    return (
      <Box p={4}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="300px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (!memories.length) {
    return null; // Don't show the section if there are no memories
  }

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      mb={8}
    >
      <VStack align="start" spacing={6}>
        <Box>
          <HStack spacing={2} mb={2}>
            <Icon as={FiCalendar} boxSize={6} color="blue.500" />
            <Heading size="lg">On This Day</Heading>
          </HStack>
          <Text color="gray.500">
            Rediscover your memories from past years
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%">
          {memories.map((memory) => (
            <MemoriesCard key={memory.id} memory={memory} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default MemoriesSection;
