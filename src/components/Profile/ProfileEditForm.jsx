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
  useToast,
  Textarea,
  Select,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'

const ProfileEditForm = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    location: '',
    bio: '',
    profession: '',
    website: '',
    interests: '',
    phoneNumber: '',
    gender: ''
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'userProfiles', currentUser.uid))
        if (userDoc.exists()) {
          setFormData(prevData => ({
            ...prevData,
            ...userDoc.data()
          }))
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        toast({
          title: 'Error loading profile',
          description: 'Failed to load your profile information. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }
    }

    if (currentUser && isOpen) {
      fetchUserProfile()
    }
  }, [currentUser, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    // Add basic validation
    if (formData.website && !formData.website.startsWith('http')) {
      toast({
        title: 'Invalid website URL',
        description: 'Please enter a valid URL starting with http:// or https://',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return false
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    const userProfileRef = doc(db, 'userProfiles', currentUser.uid)

    try {
      // Check if profile exists
      const docSnap = await getDoc(userProfileRef)
      
      if (docSnap.exists()) {
        await updateDoc(userProfileRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new profile if it doesn't exist
        await setDoc(userProfileRef, {
          ...formData,
          email: currentUser.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      toast({
        title: 'Profile updated successfully',
        description: 'Your profile information has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error updating profile',
        description: 'Failed to save your profile information. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  placeholder="Select gender"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="preferNotToSay">Prefer not to say</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Profession</FormLabel>
                <Input
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="Enter your profession"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-website.com"
                  type="url"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Interests</FormLabel>
                <Input
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="Photography, Travel, etc."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={loading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default ProfileEditForm
