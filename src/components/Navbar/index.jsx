import {
  Box,
  Container,
  HStack,
  Spacer,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserMenu from '../Auth/UserMenu'
import SignIn from '../Auth/SignIn'
import { FiHome, FiFolder, FiUpload, FiBook } from 'react-icons/fi'

const Navbar = () => {
  const { currentUser } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')

  const isActive = (path) => location.pathname === path

  return (
    <Box
      as="nav"
      position="fixed"
      w="100%"
      zIndex="sticky"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
    >
      <Container maxW="1200px">
        <HStack spacing={4}>
          <Box as={RouterLink} to="/" fontSize="2xl" fontWeight="bold">
            PictaVault
          </Box>

          {currentUser && (
            <HStack spacing={2}>
              <Tooltip label="Home" placement="bottom">
                <IconButton
                  as={RouterLink}
                  to="/home"
                  icon={<FiHome size={20} />}
                  variant={isActive('/home') ? 'solid' : 'ghost'}
                  colorScheme="purple"
                  aria-label="Home"
                />
              </Tooltip>

              <Tooltip label="Collections" placement="bottom">
                <IconButton
                  as={RouterLink}
                  to="/collections"
                  icon={<FiFolder size={20} />}
                  variant={isActive('/collections') ? 'solid' : 'ghost'}
                  colorScheme="purple"
                  aria-label="Collections"
                />
              </Tooltip>

              <Tooltip label="Memories" placement="bottom">
                <IconButton
                  as={RouterLink}
                  to="/memories"
                  icon={<FiBook size={20} />}
                  variant={isActive('/memories') ? 'solid' : 'ghost'}
                  colorScheme="purple"
                  aria-label="Memories"
                />
              </Tooltip>

              <Tooltip label="Upload" placement="bottom">
                <IconButton
                  as={RouterLink}
                  to="/upload"
                  icon={<FiUpload size={20} />}
                  variant={isActive('/upload') ? 'solid' : 'ghost'}
                  colorScheme="purple"
                  aria-label="Upload"
                />
              </Tooltip>
            </HStack>
          )}

          <Spacer />

          {currentUser ? (
            <UserMenu />
          ) : (
            !isActive('/') && (
              <Button onClick={onOpen} colorScheme="purple">
                Sign In
              </Button>
            )
          )}
        </HStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={8}>
            <SignIn onSuccess={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Navbar
