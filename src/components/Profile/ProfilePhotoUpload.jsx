import {
  Avatar,
  IconButton,
  Box,
  useToast,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { FiCamera } from 'react-icons/fi'
import { useState, useRef } from 'react'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { useAuth } from '../../context/AuthContext'

const ProfilePhotoUpload = () => {
  const { currentUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useToast()

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setUploading(true)
      const storage = getStorage()
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}`)
      await uploadBytes(storageRef, file)
      
      const photoURL = await getDownloadURL(storageRef)
      await updateProfile(currentUser, { photoURL })

      toast({
        title: 'Profile photo updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      toast({
        title: 'Error updating profile photo',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box position="relative" display="inline-block">
      <VStack>
        <Avatar
          size="2xl"
          name={currentUser?.email}
          src={currentUser?.photoURL}
          bg="blue.500"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {uploading ? (
          <Box
            position="absolute"
            bottom="0"
            right="0"
            bg="white"
            borderRadius="full"
            p={2}
            boxShadow="md"
          >
            <Spinner size="sm" color="blue.500" />
          </Box>
        ) : (
          <IconButton
            aria-label="Upload profile photo"
            icon={<FiCamera />}
            size="sm"
            colorScheme="blue"
            position="absolute"
            bottom="0"
            right="0"
            rounded="full"
            onClick={() => fileInputRef.current?.click()}
          />
        )}
      </VStack>
    </Box>
  )
}

export default ProfilePhotoUpload
