import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Button,
} from '@chakra-ui/react';
import { PHOTO_CATEGORIES, getPhotosByCategory } from '../../services/photoAnalysis';
import { useAuth } from '../../context/AuthContext';
import MediaCard from '../MediaCard';

const OrganizedPhotos = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Flatten all category tags for the select input
  const allTags = Object.values(PHOTO_CATEGORIES).flat();

  useEffect(() => {
    if (selectedCategory) {
      setAvailableTags(PHOTO_CATEGORIES[selectedCategory.toUpperCase()] || []);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const loadPhotos = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const fetchedPhotos = await getPhotosByCategory(
          user.uid,
          selectedCategory.toLowerCase(),
          selectedTags
        );
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [user, selectedCategory, selectedTags]);

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedTags([]);
  };

  return (
    <Box p={4}>
      <Flex direction="column" gap={4}>
        {/* Category and Tag Selection */}
        <Box bg={bgColor} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Flex gap={4} flexWrap="wrap">
            <Select
              placeholder="Select Category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              maxW="200px"
            >
              {Object.keys(PHOTO_CATEGORIES).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </Select>

            {selectedCategory && (
              <Select
                placeholder="Add Tags"
                onChange={(e) => handleTagSelect(e.target.value)}
                maxW="200px"
              >
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Select>
            )}
          </Flex>

          {/* Selected Tags */}
          <Flex gap={2} mt={4} flexWrap="wrap">
            {selectedTags.map(tag => (
              <Tag
                key={tag}
                size="md"
                borderRadius="full"
                variant="solid"
                colorScheme="blue"
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleTagRemove(tag)} />
              </Tag>
            ))}
          </Flex>
        </Box>

        {/* Photos Grid */}
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" />
          </Flex>
        ) : photos.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {photos.map(photo => (
              <MediaCard 
                key={photo.id} 
                post={photo}
                onUpdate={(updatedPhoto) => {
                  setPhotos(prev =>
                    prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
                  )
                }}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Flex
            justify="center"
            align="center"
            minH="200px"
            bg={bgColor}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Text>No photos found in this category</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default OrganizedPhotos;
