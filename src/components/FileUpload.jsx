import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Text,
  VStack,
  useToast,
  Progress,
  Icon,
  Image,
  AspectRatio,
  CloseButton,
  HStack,
} from '@chakra-ui/react'
import { FiUpload } from 'react-icons/fi'
import { useFileUpload } from '../hooks/useFileUpload'
import { useAuth } from '../context/AuthContext'

const FileUpload = ({ onUploadComplete }) => {
  const { uploadFile, uploading, error } = useFileUpload()
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const toast = useToast()
  const { currentUser } = useAuth()

  // Cleanup preview URL when component unmounts
  const cleanupPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
  }

  const handleFileSelect = async (file) => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upload files',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    cleanupPreview()
    
    if (file.type.startsWith('image/')) {
      // Create preview for images
      setPreview(URL.createObjectURL(file))
    } else if (file.type.startsWith('video/')) {
      // Create preview for videos
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        setPreview(video.src)
      }
    }
    setSelectedFile(file)

    // Automatically upload the file when selected
    try {
      const result = await uploadFile(file)
      onUploadComplete?.(result)
      
      toast({
        title: 'Upload successful',
        description: 'Your file has been uploaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [currentUser])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  })

  const removeFile = () => {
    setSelectedFile(null)
    cleanupPreview()
    onUploadComplete?.(null)
  }

  return (
    <Box width="100%">
      <Box
        {...getRootProps()}
        p={6}
        borderWidth={2}
        borderStyle="dashed"
        borderRadius="lg"
        textAlign="center"
        cursor="pointer"
        bg={isDragActive ? 'gray.50' : 'transparent'}
        _hover={{ bg: 'gray.50' }}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <VStack spacing={4}>
            {preview && selectedFile.type.startsWith('image/') ? (
              <AspectRatio ratio={16/9} width="100%">
                <Image
                  src={preview}
                  alt="Preview"
                  objectFit="contain"
                  borderRadius="md"
                />
              </AspectRatio>
            ) : preview && selectedFile.type.startsWith('video/') ? (
              <AspectRatio ratio={16/9} width="100%">
                <video
                  src={preview}
                  controls
                  style={{ borderRadius: '0.375rem' }}
                />
              </AspectRatio>
            ) : null}
            
            <HStack width="100%" justify="space-between">
              <Text fontSize="sm" color="gray.600">
                {selectedFile.name}
              </Text>
              <CloseButton
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
              />
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={2}>
            <Icon as={FiUpload} boxSize={6} />
            <Text>
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop or click to select'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Max file size: 50MB
            </Text>
          </VStack>
        )}
      </Box>

      {uploading && (
        <Progress
          size="sm"
          isIndeterminate
          mt={2}
          borderRadius="full"
        />
      )}

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error}
        </Text>
      )}
    </Box>
  )
}

export default FileUpload
