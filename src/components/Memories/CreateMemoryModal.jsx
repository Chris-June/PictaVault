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
  VStack,
  useToast,
  Box,
  Image,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'
import { createMemory } from '../../services/memories'

const CreateMemoryModal = ({ isOpen, onClose, onCreateMemory }) => {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image || !title.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide a title and an image',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setLoading(true)
      const newMemory = await createMemory({
        userId: currentUser.uid,
        title,
        description,
        image,
        date: new Date().toISOString(),
      })
      
      onCreateMemory(newMemory)
      handleClose()
      
    } catch (error) {
      console.error('Error creating memory:', error)
      toast({
        title: 'Error creating memory',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setImage(null)
    setImagePreview(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Memory</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your memory"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share more about this memory..."
                rows={4}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                display="none"
                id="memory-image-input"
              />
              <Button
                as="label"
                htmlFor="memory-image-input"
                cursor="pointer"
                w="100%"
              >
                {image ? 'Change Image' : 'Select Image'}
              </Button>
            </FormControl>

            {imagePreview && (
              <Box w="100%">
                <Image
                  src={imagePreview}
                  alt="Memory preview"
                  maxH="200px"
                  w="100%"
                  objectFit="cover"
                  borderRadius="md"
                />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
          >
            Create Memory
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateMemoryModal
