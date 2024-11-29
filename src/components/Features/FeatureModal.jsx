import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Box,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import { Check } from 'lucide-react'

const featureDetails = {
  'Capture & Store': {
    icon: null,
    title: 'Capture & Store',
    description: 'A secure and reliable cloud storage solution for all your precious memories.',
    benefits: [
      'Unlimited photo and video storage with high-quality preservation',
      'Automatic backup and synchronization across devices',
      'Advanced encryption to keep your memories safe',
      'Support for all major file formats including RAW images',
      'Automatic organization by date, location, and events'
    ]
  },
  'Smart Organization': {
    icon: null,
    title: 'Smart Organization',
    description: 'Leverage AI technology to automatically organize and categorize your media.',
    benefits: [
      'AI-powered photo tagging and categorization',
      'Automatic face recognition for easy people sorting',
      'Smart albums based on events, locations, and people',
      'Custom tags and categories for personalized organization',
      'Advanced search capabilities using natural language'
    ]
  },
  'Share Instantly': {
    icon: null,
    title: 'Share Instantly',
    description: 'Share your memories with loved ones quickly and securely.',
    benefits: [
      'One-click sharing to social media platforms',
      'Generate secure sharing links with expiration dates',
      'Create collaborative albums with friends and family',
      'Control privacy settings for each shared item',
      'Share directly via email or messaging apps'
    ]
  },
  'Memories Timeline': {
    icon: null,
    title: 'Memories Timeline',
    description: 'Relive your memories through an beautifully organized timeline.',
    benefits: [
      'Chronological organization of photos and videos',
      'Interactive timeline with zoom capabilities',
      'Automatic highlight reels of special moments',
      '"On This Day" memories feature',
      'Custom timeline creation for events or trips'
    ]
  },
  'Smart Search': {
    icon: null,
    title: 'Smart Search',
    description: 'Find any photo instantly using natural language and AI technology.',
    benefits: [
      'Search by description, location, or date',
      'Find photos based on objects or scenes',
      'Search by face or person',
      'Filter by emotions or activities',
      'Advanced combination searches'
    ]
  },
  'Collaborative Albums': {
    icon: null,
    title: 'Collaborative Albums',
    description: 'Create and share albums with friends and family for group memories.',
    benefits: [
      'Invite others to contribute to shared albums',
      'Real-time updates and notifications',
      'Comment and react to shared photos',
      'Download entire albums with one click',
      'Set different permission levels for contributors'
    ]
  }
};

const FeatureModal = ({ isOpen, onClose, feature }) => {
  const IconComponent = feature?.icon
  const modalBg = useColorModeValue('white', 'gray.800')
  const iconColor = useColorModeValue('#7928CA', '#FF0080')

  if (!feature) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={modalBg}>
        <ModalHeader
          display="flex"
          alignItems="center"
          gap={3}
          className="gradient-text"
        >
          <Box className="feature-icon">
            <svg width="0" height="0">
              <linearGradient id="gradient-fill" x1="0" y1="0" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7928CA" />
                <stop offset="100%" stopColor="#FF0080" />
              </linearGradient>
            </svg>
            {IconComponent && (
              <IconComponent
                size={24}
                color={iconColor}
                style={{
                  filter: `drop-shadow(0 0 4px ${iconColor}40)`
                }}
              />
            )}
          </Box>
          {feature.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={6}>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
              {feature.description}
            </Text>
            
            <Box>
              <Text 
                fontSize="lg" 
                fontWeight="semibold" 
                mb={4}
                className="gradient-text"
              >
                Key Benefits
              </Text>
              <List spacing={3}>
                {feature.benefits.map((benefit, index) => (
                  <ListItem
                    key={index}
                    display="flex"
                    alignItems="center"
                  >
                    <ListIcon 
                      as={Check} 
                      color={iconColor}
                      className="feature-icon"
                    />
                    <Text>{benefit}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default FeatureModal
