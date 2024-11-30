import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
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
  SimpleGrid,
  HStack,
} from '@chakra-ui/react';
import { 
  analyzeImage, 
  generateImageTags, 
  generateImageCaption,
  suggestCollections,
  findSimilarImages,
  generateAIArt,
} from '../../services/ai';

const ImageAnalysisModal = ({ isOpen, onClose, imageUrl, imageId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tags, setTags] = useState([]);
  const [caption, setCaption] = useState('');
  const [collections, setCollections] = useState([]);
  const [similarImages, setSimilarImages] = useState([]);
  const [aiArtUrl, setAiArtUrl] = useState(null);
  const [generatingArt, setGeneratingArt] = useState(false);
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
      setSimilarImages([]);
      setAiArtUrl(null);
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

      // Only fetch similar images if we have an imageId
      if (imageId) {
        const similarResult = await findSimilarImages(imageId);
        setSimilarImages(similarResult);
      }
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

  const handleGenerateArt = async () => {
    if (generatingArt) return;
    
    setGeneratingArt(true);
    try {
      const artUrl = await generateAIArt(imageUrl);
      setAiArtUrl(artUrl);
      toast({
        title: 'AI Art Generated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating AI art:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate AI art',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setGeneratingArt(false);
    }
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
                <HStack justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold">AI Generated Caption</Text>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    onClick={handleGenerateArt}
                    isLoading={generatingArt}
                    loadingText="Generating..."
                  >
                    Generate AI Art
                  </Button>
                </HStack>
                <Text>{caption}</Text>
              </Box>

              {aiArtUrl && (
                <Box>
                  <Text fontWeight="bold" mb={2}>AI Art Version</Text>
                  <Image
                    src={aiArtUrl}
                    alt="AI generated art"
                    borderRadius="md"
                    w="100%"
                    maxH="400px"
                    objectFit="contain"
                  />
                </Box>
              )}

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

              {similarImages.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Similar Images</Text>
                  <SimpleGrid columns={2} spacing={4}>
                    {similarImages.map((image) => (
                      <Box key={image.id} position="relative">
                        <Image
                          src={image.mediaUrl}
                          alt={image.caption}
                          borderRadius="md"
                          objectFit="cover"
                          w="100%"
                          h="150px"
                        />
                        {image.caption && (
                          <Text
                            fontSize="sm"
                            noOfLines={2}
                            mt={1}
                          >
                            {image.caption}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImageAnalysisModal;
