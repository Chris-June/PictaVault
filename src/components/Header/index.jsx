import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react'
import { FiUpload, FiHome } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import UserMenu from './UserMenu'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const isHome = location.pathname === '/home'

  return (
    <Box 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky" 
      top={0} 
      zIndex={10}
      py={4}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Heading 
              size="lg" 
              cursor="pointer"
              onClick={() => navigate('/home')}
              _hover={{ opacity: 0.8 }}
            >
              Photo Memories
            </Heading>
            <IconButton
              icon={<FiHome />}
              aria-label="Home"
              variant={isHome ? 'solid' : 'ghost'}
              colorScheme={isHome ? 'blue' : 'gray'}
              onClick={() => navigate('/home')}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: isHome ? 'md' : 'none',
              }}
              transition="all 0.2s"
            />
          </HStack>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FiUpload />}
              colorScheme="blue"
              onClick={() => navigate('/upload')}
              size="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s"
            >
              Upload
            </Button>
            <UserMenu />
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

export default Header
