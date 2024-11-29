import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Avatar,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { getUserProfile } from '../services/userProfile'
import MediaCard from '../components/MediaCard'
import ProfilePhotoUpload from '../components/Profile/ProfilePhotoUpload'
import ProfileEditForm from '../components/Profile/ProfileEditForm'
import ProfileDetails from '../components/Profile/ProfileDetails'

const Profile = () => {
  const { userId } = useParams()
  const { currentUser } = useAuth()
  const [userPosts, setUserPosts] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')

  const effectiveUserId = userId === 'me' ? currentUser?.uid : userId
  const isOwnProfile = userId === 'me' || userId === currentUser?.uid

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        if (effectiveUserId) {
          const profile = await getUserProfile(effectiveUserId)
          setUserProfile(profile)
        }

        // Fetch user posts
        const q = query(
          collection(db, 'posts'),
          where('userId', '==', effectiveUserId)
        )
        const querySnapshot = await getDocs(q)
        const posts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Convert timestamps
          let createdAt = null;
          try {
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt) {
              createdAt = new Date(data.createdAt);
            }
          } catch (error) {
            console.error('Error converting createdAt:', error);
            createdAt = new Date();
          }

          // Process comments
          const comments = data.comments?.map(comment => {
            try {
              return {
                id: comment.id || '',
                text: String(comment.text || ''),
                userId: comment.userId || '',
                userName: comment.userName || 'Anonymous',
                userPhotoURL: comment.userPhotoURL || '',
                createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date()
              };
            } catch (error) {
              console.error('Error processing comment:', error);
              return null;
            }
          }).filter(Boolean) || [];

          return {
            id: doc.id,
            ...data,
            createdAt,
            comments
          };
        });
        setUserPosts(posts)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (effectiveUserId) {
      fetchData()
    }
  }, [effectiveUserId, currentUser])

  const handleProfileUpdate = async () => {
    if (effectiveUserId) {
      const profile = await getUserProfile(effectiveUserId)
      setUserProfile(profile)
    }
  }

  const handleMediaDelete = (mediaId) => {
    setUserPosts(prev => prev.filter(post => post.id !== mediaId))
  }

  const handleMediaUpdate = (updatedMedia) => {
    setUserPosts(prev => prev.map(post => 
      post.id === updatedMedia.id ? updatedMedia : post
    ))
  }

  const handlePostDelete = async (postId) => {
    try {
      // Remove the post from the local state immediately for better UX
      setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Also update the profile stats
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          postCount: Math.max(0, (prev?.postCount || 1) - 1)
        }));
      }
    } catch (error) {
      console.error('Error handling post deletion:', error);
      // Refresh the posts list in case of error
      fetchData();
    }
  };

  if (loading) {
    return null // or a loading spinner
  }

  return (
    <Container maxW="1200px" py={8}>
      <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
        <GridItem>
          <VStack spacing={8}>
            {/* Profile Header */}
            <Box
              w="100%"
              p={6}
              borderRadius="lg"
              bg={bgColor}
              shadow="sm"
            >
              <VStack spacing={4}>
                {isOwnProfile ? (
                  <ProfilePhotoUpload />
                ) : (
                  <Avatar
                    size="2xl"
                    name={userProfile?.email || 'User'}
                    src={currentUser?.photoURL}
                  />
                )}
                <Text fontSize="2xl" fontWeight="bold">
                  {userProfile?.firstName 
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : userProfile?.email || 'User'}
                </Text>
                
                <HStack spacing={8}>
                  <Stat textAlign="center">
                    <StatLabel>Posts</StatLabel>
                    <StatNumber>{userPosts.length}</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Followers</StatLabel>
                    <StatNumber>0</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Following</StatLabel>
                    <StatNumber>0</StatNumber>
                  </Stat>
                </HStack>

                {isOwnProfile && (
                  <Button 
                    colorScheme="blue" 
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </VStack>
            </Box>

            {/* Profile Details */}
            <ProfileDetails userId={effectiveUserId} />
          </VStack>
        </GridItem>

        <GridItem>
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={4}
            w="100%"
          >
            {userPosts.map(post => {
              // Format comments properly
              const formattedComments = Array.isArray(post.comments) 
                ? post.comments.map(comment => ({
                    id: comment.id || '',
                    text: String(comment.text || ''),
                    userId: comment.userId || '',
                    userName: comment.userName || 'Anonymous',
                    userPhotoURL: comment.userPhotoURL || '',
                    createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date()
                  }))
                : [];

              return (
                <MediaCard
                  key={post.id}
                  post={{
                    ...post,
                    comments: formattedComments,
                    createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(),
                    userName: userProfile?.firstName 
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : userProfile?.email || 'User'
                  }}
                  isProfile={true}
                  onDelete={handlePostDelete}
                  onUpdate={handleMediaUpdate}
                />
              );
            })}
          </SimpleGrid>
        </GridItem>
      </Grid>

      {isOwnProfile && (
        <ProfileEditForm 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false)
            handleProfileUpdate()
          }} 
        />
      )}
    </Container>
  )
}

export default Profile
