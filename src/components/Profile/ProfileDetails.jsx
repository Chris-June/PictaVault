import {
  Box,
  VStack,
  HStack,
  Text,
  Link,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiMapPin, FiGlobe, FiBriefcase, FiPhone, FiCalendar } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'

const ProfileDetails = ({ userId }) => {
  const [profileData, setProfileData] = useState(null)
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const sectionBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'userProfiles', userId))
        if (userDoc.exists()) {
          setProfileData(userDoc.data())
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    if (userId) {
      fetchProfileData()
    }
  }, [userId])

  if (!profileData) {
    return null
  }

  const InfoItem = ({ icon, label, value, isLink }) => {
    if (!value) return null

    return (
      <HStack spacing={3} color={textColor}>
        <Icon as={icon} />
        <Text fontWeight="medium">{label}:</Text>
        {isLink ? (
          <Link href={value} isExternal color="blue.500">
            {value}
          </Link>
        ) : (
          <Text>{value}</Text>
        )}
      </HStack>
    )
  }

  return (
    <VStack
      spacing={4}
      align="stretch"
      w="100%"
      bg={sectionBg}
      p={6}
      borderRadius="lg"
      shadow="sm"
    >
      {/* Basic Info */}
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          {profileData.firstName} {profileData.lastName}
        </Text>
        {profileData.bio && (
          <Text color={textColor} mb={4}>
            {profileData.bio}
          </Text>
        )}
      </Box>

      <Divider />

      {/* Contact & Location */}
      <VStack align="stretch" spacing={3}>
        <InfoItem
          icon={FiMapPin}
          label="Location"
          value={profileData.location}
        />
        <InfoItem
          icon={FiBriefcase}
          label="Profession"
          value={profileData.profession}
        />
        <InfoItem
          icon={FiGlobe}
          label="Website"
          value={profileData.website}
          isLink
        />
        <InfoItem
          icon={FiPhone}
          label="Phone"
          value={profileData.phoneNumber}
        />
        <InfoItem
          icon={FiCalendar}
          label="Birth Date"
          value={profileData.dateOfBirth}
        />
      </VStack>

      {profileData.interests && (
        <>
          <Divider />
          <Box>
            <Text fontWeight="medium" mb={2}>
              Interests
            </Text>
            <Text color={textColor}>
              {profileData.interests}
            </Text>
          </Box>
        </>
      )}
    </VStack>
  )
}

export default ProfileDetails
