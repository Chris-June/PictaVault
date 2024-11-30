import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  useColorModeValue,
  Icon,
  HStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiClock, FiMessageSquare } from 'react-icons/fi';
import { format } from 'date-fns';
import MemoryChat from './MemoryChat';

const MemoriesCard = ({ memory }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.02)' }}
        cursor="pointer"
      >
        <Box position="relative">
          <Image
            src={memory.imageUrl}
            alt={memory.caption || 'Memory photo'}
            width="100%"
            height="200px"
            objectFit="cover"
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            p={4}
            background="linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)"
          >
            <HStack spacing={2} color="white">
              <Icon as={FiClock} />
              <Text fontWeight="bold">
                {memory.yearsAgo} {memory.yearsAgo === 1 ? 'year' : 'years'} ago
              </Text>
            </HStack>
          </Box>
        </Box>

        <VStack p={4} align="start" spacing={2}>
          <Text fontSize="sm" color="gray.500">
            {format(memory.timestamp.toDate(), 'MMMM d, yyyy')}
          </Text>
          {memory.caption && (
            <Text noOfLines={2}>{memory.caption}</Text>
          )}
          <Button
            leftIcon={<FiMessageSquare />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={onOpen}
          >
            Reflect on this memory
          </Button>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            Memory from {format(memory.timestamp.toDate(), 'MMMM d, yyyy')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Image
                src={memory.imageUrl}
                alt={memory.caption || 'Memory photo'}
                borderRadius="lg"
                maxH="300px"
                objectFit="cover"
              />
              <MemoryChat memory={memory} />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MemoriesCard;
