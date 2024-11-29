import { useState } from 'react'
import {
  Box,
  VStack,
  Button,
  Textarea,
  useToast,
  Text
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import FileUpload from './FileUpload'
import { createPost } from '../services/posts'

const CreatePost = ({ onPostCreated }) => {
  const [caption, setCaption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const { currentUser } = useAuth()
  const toast = useToast()

  const handleUploadComplete = (fileData) => {
    setUploadedFile(fileData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!uploadedFile) {
      toast({
        title: 'No media selected',
        description: 'Please upload an image or video first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setIsSubmitting(true)

      const post = await createPost({
        mediaUrl: uploadedFile.url,
        mediaPath: uploadedFile.path,
        mediaType: uploadedFile.contentType.split('/')[0], // 'image' or 'video'
        caption,
        userId: currentUser.uid
      })

      toast({
        title: 'Post created!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Reset form
      setCaption('')
      setUploadedFile(null)
      
      // Notify parent component
      onPostCreated?.(post)
    } catch (error) {
      toast({
        title: 'Error creating post',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser) {
    return (
      <Box p={4} borderWidth={1} borderRadius="lg">
        <Text>Please sign in to create a post</Text>
      </Box>
    )
  }

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth={1} borderRadius="lg">
      <VStack spacing={4}>
        <FileUpload onUploadComplete={handleUploadComplete} />
        
        {uploadedFile && (
          <Text fontSize="sm" color="green.500">
            File uploaded successfully!
          </Text>
        )}

        <Textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          resize="vertical"
        />

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Creating post..."
          width="full"
        >
          Create Post
        </Button>
      </VStack>
    </Box>
  )
}

export default CreatePost
