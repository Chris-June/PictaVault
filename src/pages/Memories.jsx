import React from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import MemoriesSection from '../components/Memories/MemoriesSection';

const Memories = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={4} align="start" mb={8}>
        <Heading size="xl">Your Memories</Heading>
        <Text color={textColor}>
          Rediscover and relive your precious moments from this day in previous years.
        </Text>
      </VStack>
      
      <MemoriesSection />
    </Container>
  );
};

export default Memories;
