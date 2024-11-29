import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
  Switch,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getNotificationSettings,
  updateNotificationSettings,
  requestPushPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '../services/notifications'

const Settings = () => {
  const { currentUser, updateUserProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    preferences: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true
    }
  })
  const [permissionStatus, setPermissionStatus] = useState(null)
  const toast = useToast()

  // Load notification settings
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        if (currentUser?.uid) {
          const settings = await getNotificationSettings(currentUser.uid)
          setNotifications(settings)
          
          // Check push notification permission status
          if ('Notification' in window) {
            setPermissionStatus(Notification.permission)
          }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error)
        toast({
          title: 'Error',
          description: 'Could not load notification settings',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }

    loadNotificationSettings()
  }, [currentUser])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = async (type) => {
    try {
      setIsLoading(true)
      const newSettings = { ...notifications }

      if (type === 'push') {
        if (!notifications.push) {
          // Enable push notifications
          const granted = await requestPushPermission()
          if (granted) {
            await subscribeToPushNotifications(currentUser.uid)
            newSettings.push = true
            setPermissionStatus('granted')
          } else {
            setPermissionStatus('denied')
            return
          }
        } else {
          // Disable push notifications
          await unsubscribeFromPushNotifications(currentUser.uid)
          newSettings.push = false
        }
      } else if (type === 'email') {
        newSettings.email = !notifications.email
      } else if (type.startsWith('pref_')) {
        const pref = type.replace('pref_', '')
        newSettings.preferences[pref] = !notifications.preferences[pref]
      }

      await updateNotificationSettings(currentUser.uid, newSettings)
      setNotifications(newSettings)

      toast({
        title: 'Settings updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserProfile({
        displayName: formData.displayName,
      })

      toast({
        title: 'Settings updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Settings</Heading>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">Profile Settings</Heading>
            
            <FormControl>
              <FormLabel>Display Name</FormLabel>
              <Input
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Enter your display name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formData.email}
                isReadOnly
                _disabled={{ opacity: 0.8 }}
                cursor="not-allowed"
                color="gray.600"
                bg="gray.100"
                borderColor="gray.300"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Email cannot be changed
              </Text>
            </FormControl>

            <Divider />

            <Heading size="md">Notification Settings</Heading>

            {permissionStatus === 'denied' && (
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Push Notifications Blocked</AlertTitle>
                  <AlertDescription>
                    Please enable notifications for this site in your browser settings to receive push notifications.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="email-notifications" mb="0">
                Email Notifications
              </FormLabel>
              <Switch
                id="email-notifications"
                isChecked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                isDisabled={isLoading}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="push-notifications" mb="0">
                Push Notifications
              </FormLabel>
              <Switch
                id="push-notifications"
                isChecked={notifications.push}
                onChange={() => handleNotificationChange('push')}
                isDisabled={isLoading || !('Notification' in window)}
              />
            </FormControl>

            <Box pl={4}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Notify me about:
              </Text>
              <VStack align="stretch" spacing={2}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="pref-likes" mb="0" fontSize="sm">
                    Likes on my posts
                  </FormLabel>
                  <Switch
                    id="pref-likes"
                    size="sm"
                    isChecked={notifications.preferences.likes}
                    onChange={() => handleNotificationChange('pref_likes')}
                    isDisabled={isLoading}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="pref-comments" mb="0" fontSize="sm">
                    Comments on my posts
                  </FormLabel>
                  <Switch
                    id="pref-comments"
                    size="sm"
                    isChecked={notifications.preferences.comments}
                    onChange={() => handleNotificationChange('pref_comments')}
                    isDisabled={isLoading}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="pref-follows" mb="0" fontSize="sm">
                    New followers
                  </FormLabel>
                  <Switch
                    id="pref-follows"
                    size="sm"
                    isChecked={notifications.preferences.follows}
                    onChange={() => handleNotificationChange('pref_follows')}
                    isDisabled={isLoading}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="pref-mentions" mb="0" fontSize="sm">
                    Mentions
                  </FormLabel>
                  <Switch
                    id="pref-mentions"
                    size="sm"
                    isChecked={notifications.preferences.mentions}
                    onChange={() => handleNotificationChange('pref_mentions')}
                    isDisabled={isLoading}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              mt={4}
            >
              Save Changes
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Settings
