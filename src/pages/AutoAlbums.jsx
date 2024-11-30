import React from 'react';
import { Container, Heading, Text, VStack } from '@chakra-ui/react';
import AutoAlbumGenerator from '../components/AutoAlbums/AutoAlbumGenerator';

const AutoAlbums = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <VStack align="stretch" spacing={2}>
          <Heading size="lg">Auto-Generated Albums</Heading>
          <Text color="gray.500">
            Let AI analyze your photos and suggest albums based on common themes and tags.
          </Text>
        </VStack>
        
        <AutoAlbumGenerator />
      </VStack>
    </Container>
  );
};

export default AutoAlbums;
