import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Divider,
  Box,
  useToast,
  Spinner,
  Button,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { 
  analyzeImage, 
  generateImageTags, 
  generateImageCaption,
  suggestCollections,
} from '../../services/ai';

const ImageAnalysisModal = ({ isOpen, onClose, imageUrl, imageId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tags, setTags] = useState([]);
  const [caption, setCaption] = useState('');
  const [collections, setCollections] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && imageUrl) {
      analyzeImageData();
    } else {
      // Reset state when modal closes
      setError(null);
      setAnalysis(null);
      setTags([]);
      setCaption('');
      setCollections([]);
    }
  }, [isOpen, imageUrl]);

  const analyzeImageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysisResult, tagsResult, captionResult, collectionsResult] = await Promise.all([
        analyzeImage(imageUrl),
        generateImageTags(imageUrl),
        generateImageCaption(imageUrl),
        suggestCollections(imageUrl),
      ]);

      setAnalysis(analysisResult);
      setTags(tagsResult);
      setCaption(captionResult);
      setCollections(collectionsResult);
    } catch (error) {
      console.error('Error in image analysis:', error);
      setError(error.message);
      toast({
        title: 'Error analyzing image',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    analyzeImageData();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Image Analysis</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="xl" />
              <Text>Analyzing image...</Text>
            </VStack>
          ) : error ? (
            <VStack spacing={4} py={8}>
              <Alert status="error">
                <AlertIcon />
                <Box>
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Box>
              </Alert>
              <Button onClick={handleRetry} colorScheme="blue">
                Retry Analysis
              </Button>
            </VStack>
          ) : (
            <VStack spacing={6} align="stretch">
              <Box>
                <Image src={imageUrl} alt="Analyzed image" borderRadius="md" />
              </Box>
              
              <Box>
                <Text fontWeight="bold" mb={2}>Caption</Text>
                <Text>{caption}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Tags</Text>
                <Wrap>
                  {tags.map((tag, index) => (
                    <WrapItem key={index}>
                      <Tag size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Suggested Collections</Text>
                <Wrap>
                  {collections.map((collection, index) => (
                    <WrapItem key={index}>
                      <Tag size="md" borderRadius="full" variant="subtle" colorScheme="green">
                        <TagLabel>{collection}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Detailed Analysis</Text>
                <Text>{analysis}</Text>
              </Box>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImageAnalysisModal;
