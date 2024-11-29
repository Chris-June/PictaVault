import { useState, useEffect } from 'react'
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
  Switch,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { updateCollection } from '../../services/collections'

const EditCollectionModal = ({ isOpen, onClose, collection, onUpdate }) => {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  })

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        isPrivate: collection.isPrivate || false,
      })
    }
  }, [collection])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({
        title: 'Name is required',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setIsSubmitting(true)
      await updateCollection(collection.id, formData)
      
      const updatedCollection = {
        ...collection,
        ...formData,
      }
      
      onUpdate(updatedCollection)
      toast({
        title: 'Collection updated',
        status: 'success',
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error('Error updating collection:', error)
      toast({
        title: 'Error updating collection',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Collection</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Collection Name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Collection Description"
                  resize="vertical"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isPrivate" mb={0}>
                  Private Collection
                </FormLabel>
                <Switch
                  id="isPrivate"
                  name="isPrivate"
                  isChecked={formData.isPrivate}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditCollectionModal
