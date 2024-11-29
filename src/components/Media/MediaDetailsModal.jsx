import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Textarea,
  useToast,
  Image,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { useState } from 'react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../../services/firebase'
import { FiTrash2 } from 'react-icons/fi'

const MediaDetailsModal = ({ isOpen, onClose, media, onDelete, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: media.title || '',
    description: media.description || '',
    tags: media.tags?.join(', ') || '',
    location: media.location || ''
  })
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const mediaRef = doc(db, 'posts', media.id)
      const updatedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(mediaRef, updatedData)
      
      toast({
        title: 'Media updated',
        description: 'Your media details have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      
      if (onUpdate) {
        onUpdate(updatedData)
      }
      onClose()
    } catch (error) {
      console.error('Error updating media:', error)
      toast({
        title: 'Error updating media',
        description: 'Failed to update media details. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Delete from Storage
      const storageRef = ref(storage, media.imageUrl)
      await deleteObject(storageRef)

      // Delete from Firestore
      await deleteDoc(doc(db, 'posts', media.id))

      toast({
        title: 'Media deleted',
        description: 'Your media has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })

      if (onDelete) {
        onDelete(media.id)
      }
      onClose()
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: 'Error deleting media',
        description: 'Failed to delete media. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Media Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Image
              src={media.imageUrl}
              alt={formData.title}
              borderRadius="md"
              maxH="300px"
              objectFit="cover"
            />

            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a title for your media"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your media"
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Where was this taken?"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={4}>
            <IconButton
              icon={<FiTrash2 />}
              colorScheme="red"
              variant="ghost"
              onClick={handleDelete}
              isLoading={isDeleting}
              aria-label="Delete media"
            />
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdate}
              isLoading={loading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MediaDetailsModal
