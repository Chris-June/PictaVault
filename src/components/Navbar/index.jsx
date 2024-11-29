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
import { FiHome } from 'react-icons/fi'

const Navbar = () => {
  const { currentUser } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')

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

          <Tooltip
            label="Go to Home"
            placement="bottom"
            hasArrow
            isDisabled={isHomePage}
          >
            <IconButton
              as={RouterLink}
              to="/"
              icon={<FiHome size="1.2em" />}
              variant={isHomePage ? "solid" : "ghost"}
              colorScheme="blue"
              aria-label="Home"
              isDisabled={isHomePage}
            />
          </Tooltip>

          <Spacer />

          {currentUser ? (
            <>
              <Button as={RouterLink} to="/upload" colorScheme="blue">
                Upload
              </Button>
              <UserMenu />
            </>
          ) : (
            <Button onClick={onOpen} colorScheme="blue">
              Sign In
            </Button>
          )}
        </HStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={8}>
            <SignIn onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Navbar
