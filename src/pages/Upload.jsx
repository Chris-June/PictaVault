import {
  Box,
  Container,
  VStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Text,
  Image,
  AspectRatio,
  Progress,
  IconButton,
  useColorModeValue,
  Tooltip,
  Icon,
  Flex,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { storage, db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { FiUpload, FiX, FiInfo } from 'react-icons/fi'

const Upload = () => {
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [captionError, setCaptionError] = useState('')
  const [locationError, setLocationError] = useState('')
  
  const CAPTION_MAX_LENGTH = 150
  const LOCATION_REGEX = /^[a-zA-Z0-9\s,.-]+$/

  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    // Cleanup previews when component unmounts
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))
    setFiles(newFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const handleAddTag = (e) => {
    e.preventDefault()
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const validateCaption = (value) => {
    if (value.length > CAPTION_MAX_LENGTH) {
      setCaptionError(`Caption must be ${CAPTION_MAX_LENGTH} characters or less`)
      toast({
        title: 'Invalid Caption',
        description: `Caption must be ${CAPTION_MAX_LENGTH} characters or less`,
        status: 'error',
        duration: 3000,
      })
      return false
    }
    setCaptionError('')
    return true
  }

  const validateLocation = (value) => {
    if (value && !LOCATION_REGEX.test(value)) {
      setLocationError('Location can only contain letters, numbers, spaces, commas, periods, and hyphens')
      toast({
        title: 'Invalid Location',
        description: 'Location contains invalid characters',
        status: 'error',
        duration: 3000,
      })
      return false
    }
    setLocationError('')
    return true
  }

  const handleCaptionChange = (e) => {
    const value = e.target.value
    setCaption(value)
    validateCaption(value)
  }

  const handleLocationChange = (e) => {
    const value = e.target.value
    if (validateLocation(value)) {
      setLocation(value)
    }
  }

  const handleUpload = async () => {
    // Validate all fields before upload
    if (!files.length || !caption) {
      toast({
        title: 'Error',
        description: 'Please select a file and add a caption',
        status: 'error',
        duration: 3000,
      })
      return
    }

    if (!validateCaption(caption) || (location && !validateLocation(location))) {
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const file = files[0]
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}.${fileExtension}`
      const storageRef = ref(storage, `media/${currentUser.uid}/${fileName}`)
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Create post document
      await addDoc(collection(db, 'posts'), {
        userId: currentUser.uid,
        mediaUrl: downloadURL,
        mediaPath: `media/${currentUser.uid}/${fileName}`,
        mediaType: file.type.split('/')[0], // 'image' or 'video'
        caption,
        location,
        tags,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
      })

      toast({
        title: 'Success',
        description: 'Your media has been uploaded!',
        status: 'success',
        duration: 3000,
      })

      // Navigate to profile page instead of home
      navigate(`/profile/me`)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const removeFile = () => {
    setFiles([])
  }

  if (!currentUser) {
    return (
      <Container maxW="container.md" py={8}>
        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <Text textAlign="center">Please sign in to upload media</Text>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <VStack spacing={6}>
            <Text fontSize="2xl" fontWeight="bold">
              Upload Media
            </Text>

            {files.length > 0 ? (
              <Box position="relative" width="100%">
                <AspectRatio ratio={16/9} width="100%">
                  {files[0].type.startsWith('video/') ? (
                    <video
                      src={files[0].preview}
                      controls
                      style={{ borderRadius: '0.5rem' }}
                    />
                  ) : (
                    <Image
                      src={files[0].preview}
                      alt="Preview"
                      objectFit="contain"
                      borderRadius="lg"
                    />
                  )}
                </AspectRatio>
                <IconButton
                  icon={<FiX />}
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={removeFile}
                  colorScheme="red"
                  variant="solid"
                  isRound
                  size="sm"
                />
              </Box>
            ) : (
              <Box
                {...getRootProps()}
                p={10}
                borderWidth={2}
                borderStyle="dashed"
                borderRadius="lg"
                borderColor={isDragActive ? 'blue.400' : borderColor}
                cursor="pointer"
                _hover={{ borderColor: 'blue.400' }}
                transition="all 0.2s"
                width="100%"
              >
                <input {...getInputProps()} />
                <VStack spacing={2}>
                  <FiUpload size={24} />
                  <Text>
                    {isDragActive
                      ? 'Drop your file here'
                      : 'Drag & drop or click to select'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Supports images and videos up to 50MB
                  </Text>
                </VStack>
              </Box>
            )}

            <FormControl isRequired isInvalid={!!captionError}>
              <Flex align="center" mb={2}>
                <FormLabel mb={0}>Caption</FormLabel>
                <Tooltip label={`Maximum ${CAPTION_MAX_LENGTH} characters allowed`} placement="top" hasArrow>
                  <Box display="inline-block">
                    <Icon as={FiInfo} color="gray.500" cursor="pointer" ml={1} />
                  </Box>
                </Tooltip>
              </Flex>
              <Textarea
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Write a caption for your post..."
                resize="vertical"
                maxLength={CAPTION_MAX_LENGTH}
              />
              <Flex justify="space-between" mt={1}>
                <FormErrorMessage>{captionError}</FormErrorMessage>
                <Text fontSize="sm" color={caption.length > CAPTION_MAX_LENGTH ? "red.500" : "gray.500"}>
                  {caption.length}/{CAPTION_MAX_LENGTH}
                </Text>
              </Flex>
            </FormControl>

            <FormControl isInvalid={!!locationError}>
              <Flex align="center" mb={2}>
                <FormLabel mb={0}>Location</FormLabel>
                <Tooltip label="Enter a valid location using letters, numbers, spaces, commas, periods, or hyphens" placement="top" hasArrow>
                  <Box display="inline-block">
                    <Icon as={FiInfo} color="gray.500" cursor="pointer" ml={1} />
                  </Box>
                </Tooltip>
              </Flex>
              <Input
                value={location}
                onChange={handleLocationChange}
                placeholder="Add a location (e.g., 'New York City' or '123 Main St')"
              />
              <FormErrorMessage>{locationError}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Flex align="center" mb={2}>
                <FormLabel mb={0}>Tags</FormLabel>
                <Tooltip label="Words in your caption are automatically converted to tags. You can also add additional tags here." placement="top" hasArrow>
                  <Box display="inline-block">
                    <Icon as={FiInfo} color="gray.500" cursor="pointer" ml={1} />
                  </Box>
                </Tooltip>
              </Flex>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Input
                    value={currentTag}
                    onChange={(e) => {
                      // Remove # if user types it
                      const value = e.target.value.startsWith('#') 
                        ? e.target.value.slice(1) 
                        : e.target.value;
                      setCurrentTag(value);
                    }}
                    placeholder="Add additional tags"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e);
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} colorScheme="blue">
                    Add
                  </Button>
                </HStack>
                {tags.length > 0 && (
                  <Flex wrap="wrap" gap={2}>
                    {tags.map((tag, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                      >
                        <TagLabel>{tag.startsWith('#') ? tag : `#${tag}`}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                      </Tag>
                    ))}
                  </Flex>
                )}
              </VStack>
            </FormControl>

            {uploading && (
              <Progress
                value={progress}
                size="sm"
                width="100%"
                borderRadius="full"
                isIndeterminate
              />
            )}

            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handleUpload}
              isLoading={uploading}
              loadingText="Uploading..."
              isDisabled={!files.length || !caption}
            >
              Upload
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Upload
