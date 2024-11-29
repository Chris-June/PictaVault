import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  SimpleGrid,
  Link,
  useDisclosure,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Share2,
  Heart,
  Tag,
  MapPin,
  Search,
  Image as ImageIcon,
  Video,
  MessageCircle,
  Clock,
  Users,
} from 'lucide-react'
import { RiSparklingFill } from 'react-icons/ri'
import '../styles/gradientText.css'
import FeatureModal from '../components/Features/FeatureModal'
import { useState } from 'react'

const Feature = ({ title, text, icon: Icon, onClick }) => {
  const iconColor = useColorModeValue('#7928CA', '#FF0080');
  
  return (
    <Stack
      onClick={onClick}
      cursor="pointer"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      align={'center'}
      pos={'relative'}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: useColorModeValue(
          '0 4px 12px rgba(121, 40, 202, 0.1)',
          '0 4px 12px rgba(255, 0, 128, 0.2)'
        ),
      }}
      transition="all 0.3s ease"
    >
      <Box
        className="feature-icon"
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <svg width="0" height="0">
          <linearGradient id="gradient-fill" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7928CA" />
            <stop offset="100%" stopColor="#FF0080" />
          </linearGradient>
        </svg>
        <Icon 
          size={36} 
          color={iconColor}
          style={{
            filter: `drop-shadow(0 0 4px ${iconColor}40)`
          }}
        />
      </Box>
      <Text fontWeight={600} fontSize={'lg'}>
        {title}
      </Text>
      <Text textAlign={'center'} color={'gray.500'} fontSize={'sm'}>
        {text}
      </Text>
    </Stack>
  )
}

const GradientSparkle = () => (
  <Box className="sparkle-icon" fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}>
    <svg width="0" height="0">
      <linearGradient id="gradient-fill" x1="0" y1="0" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7928CA">
          <animate
            attributeName="stop-color"
            values="#7928CA; #FF0080; #7928CA"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="100%" stopColor="#FF0080">
          <animate
            attributeName="stop-color"
            values="#FF0080; #7928CA; #FF0080"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
    </svg>
    <RiSparklingFill style={{ fill: 'url(#gradient-fill)' }} />
  </Box>
);

const Landing = () => {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedFeature, setSelectedFeature] = useState(null)

  const featureDetails = {
    capture: {
      title: 'Capture & Store',
      description: 'Your memories deserve the best storage solution. With PictaVault, every photo is securely stored in the cloud with uncompromised quality.',
      benefits: [
        'Unlimited cloud storage for all your photos',
        'Automatic backup and synchronization',
        'Original quality preservation',
        'Secure end-to-end encryption',
        'Multi-device access and backup'
      ],
      icon: Camera
    },
    organize: {
      title: 'Smart Organization',
      description: 'Let AI do the heavy lifting. Our advanced algorithms automatically categorize and tag your photos, making organization effortless.',
      benefits: [
        'AI-powered photo categorization',
        'Automatic face recognition',
        'Smart album suggestions',
        'Location-based organization',
        'Custom tagging system'
      ],
      icon: Tag
    },
    share: {
      title: 'Share Instantly',
      description: 'Sharing memories should be as easy as making them. Share your photos with friends and family instantly, while maintaining full control.',
      benefits: [
        'One-click sharing to any platform',
        'Custom sharing permissions',
        'Generate shareable links',
        'Direct social media integration',
        'Real-time collaboration'
      ],
      icon: Share2
    },
    timeline: {
      title: 'Memories Timeline',
      description: 'Relive your precious moments through an beautifully organized timeline. Navigate through your memories with ease.',
      benefits: [
        'Interactive timeline view',
        'Date-based organization',
        'Memory highlights',
        'Customizable time periods',
        'Special event markers'
      ],
      icon: Clock
    },
    search: {
      title: 'Smart Search',
      description: 'Find any photo instantly with our AI-powered search. Use natural language to describe what you\'re looking for.',
      benefits: [
        'Natural language search',
        'Object and scene recognition',
        'Face-based search',
        'Location-based search',
        'Advanced filters and sorting'
      ],
      icon: Search
    },
    albums: {
      title: 'Collaborative Albums',
      description: 'Create shared spaces for collective memories. Collaborate with friends and family to build beautiful photo collections together.',
      benefits: [
        'Create unlimited shared albums',
        'Real-time collaboration',
        'Comment and react on photos',
        'Activity notifications',
        'Access control management'
      ],
      icon: Users
    }
  }

  const handleFeatureClick = (featureId) => {
    setSelectedFeature(featureDetails[featureId])
    onOpen()
  }

  const features = [
    {
      title: 'Capture & Store',
      text: 'Securely store your photos with unlimited cloud storage.',
      icon: Camera,
      id: 'capture'
    },
    {
      title: 'Smart Organization',
      text: 'AI-powered categorization for effortless photo management.',
      icon: Tag,
      id: 'organize'
    },
    {
      title: 'Share Instantly',
      text: 'Share your memories with friends and family in seconds.',
      icon: Share2,
      id: 'share'
    },
    {
      title: 'Memories Timeline',
      text: 'Relive your memories through an interactive timeline.',
      icon: Clock,
      id: 'timeline'
    },
    {
      title: 'Smart Search',
      text: 'Find any photo instantly with AI-powered search.',
      icon: Search,
      id: 'search'
    },
    {
      title: 'Collaborative Albums',
      text: 'Create and share albums with friends and family.',
      icon: Users,
      id: 'albums'
    }
  ]

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Header Navigation */}
      <Flex
        as="header"
        position="fixed"
        w="100%"
        bg={useColorModeValue('white', 'gray.800')}
        px={8}
        py={4}
        boxShadow="sm"
        zIndex="sticky"
      >
        <Flex justify="space-between" align="center" maxW="container.xl" w="100%" mx="auto">
          <Text fontSize="2xl" fontWeight="bold">
            PictaVault
          </Text>
          <HStack spacing={4}>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth/signin')}
              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
            >
              Sign In
            </Button>
          </HStack>
        </Flex>
      </Flex>

      <Container maxW={'7xl'} py={20}>
        <Stack
          align={'center'}
          spacing={{ base: 8, md: 10 }}
          textAlign={'center'}
          mb={20}
        >
          <Heading
            fontWeight={700}
            fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
            className="gradient-text"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <Text as="span">Capture Moments</Text>
            <GradientSparkle />
            <Text as="span">Share Memories</Text>
          </Heading>
          <Text color={'gray.500'} maxW={'3xl'} fontSize={'xl'}>
            PictaVault is your personal space to store, organize, and share life's precious moments.
            With powerful AI features, secure storage, and seamless sharing, your memories are always
            just a click away.
          </Text>
         
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {features.map((feature, index) => (
            <Feature
              key={index}
              title={feature.title}
              text={feature.text}
              icon={feature.icon}
              onClick={() => handleFeatureClick(feature.id)}
            />
          ))}
        </SimpleGrid>

        <FeatureModal
          isOpen={isOpen}
          onClose={onClose}
          feature={selectedFeature}
          onClose={() => {
            setSelectedFeature(null);
            onClose();
          }}
        />
      </Container>

      {/* Footer */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} color={useColorModeValue('gray.700', 'gray.200')}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={10}
          spacing={8}
        >
          <Stack spacing={6}>
            <Heading
              fontSize={'2xl'}
              className="gradient-text"
              textAlign={'center'}
            >
              Stay Connected with PictaVault
            </Heading>
            <VStack spacing={2}>
              <Text fontSize={'sm'} textAlign={'center'}>
                2024 PictaVault. All rights reserved
              </Text>
              <Text 
                fontSize={'sm'} 
                textAlign={'center'}
                className="gradient-text-fast"
                fontWeight="medium"
              >
                Powered by Intellisync Solutions
              </Text>
            </VStack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing
