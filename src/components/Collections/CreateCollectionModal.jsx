import { useState } from 'react'
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
import { useAuth } from '../../context/AuthContext'
import { createCollection } from '../../services/collections'

const CreateCollectionModal = ({ isOpen, onClose, onCollectionCreated }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  })

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
      const newCollection = await createCollection({
        ...formData,
        userId: user.uid,
      })
      
      toast({
        title: 'Collection created',
        status: 'success',
        duration: 3000,
      })
      
      onCollectionCreated(newCollection)
      setFormData({ name: '', description: '', isPrivate: false })
    } catch (error) {
      console.error('Error creating collection:', error)
      toast({
        title: 'Error creating collection',
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
          <ModalHeader>Create New Collection</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Awesome Collection"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What's this collection about?"
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
              Create Collection
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CreateCollectionModal
