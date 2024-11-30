import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Image,
  Box,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { updatePost } from '../../services/posts';
import CaptionSuggestionModal from '../Upload/CaptionSuggestionModal';

const EditMediaModal = ({ isOpen, onClose, media, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (media) {
      setTitle(media.title || '');
      setDescription(media.description || '');
      setTags(media.tags || []);
    }
  }, [media]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const updatedData = {
        id: media.id,
        title: title.trim(),
        description: description.trim(),
        tags: tags,
      };

      await updatePost(updatedData);
      
      if (onUpdate) {
        onUpdate(updatedData);
      }

      toast({
        title: 'Success',
        description: 'Media information updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('Error updating media:', error);
      toast({
        title: 'Error',
        description: 'Failed to update media information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptionSelect = (caption) => {
    setDescription(caption);
    setIsCaptionModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Media Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box width="100%">
                <Image
                  src={media?.mediaUrl}
                  alt={media?.title}
                  borderRadius="md"
                  width="100%"
                  maxHeight="300px"
                  objectFit="cover"
                />
              </Box>

              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <HStack width="100%">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description"
                    rows={4}
                  />
                  <IconButton
                    icon={<FiPlus />}
                    onClick={() => setIsCaptionModalOpen(true)}
                    aria-label="Get AI caption suggestions"
                    title="Get AI caption suggestions"
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <HStack>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <IconButton
                    icon={<FiPlus />}
                    onClick={handleAddTag}
                    aria-label="Add tag"
                  />
                </HStack>
                <Wrap mt={2}>
                  {tags.map((tag, index) => (
                    <WrapItem key={index}>
                      <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CaptionSuggestionModal
        isOpen={isCaptionModalOpen}
        onClose={() => setIsCaptionModalOpen(false)}
        imageUrl={media?.mediaUrl}
        onSelectCaption={handleCaptionSelect}
        initialCaption={description}
      />
    </>
  );
};

export default EditMediaModal;
