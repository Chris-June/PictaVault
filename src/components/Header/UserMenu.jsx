import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  HStack,
  Divider,
  useToast,
} from '@chakra-ui/react'
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const UserMenu = () => {
  const navigate = useNavigate()
  const { currentUser, signOut } = useAuth()
  const toast = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FiUser />}
        variant="ghost"
        aria-label="User menu"
        _hover={{
          bg: 'gray.100',
          transform: 'translateY(-2px)',
        }}
        transition="all 0.2s"
      />
      <MenuList>
        <MenuItem onClick={() => navigate(`/profile/${currentUser?.uid}`)}>
          <HStack>
            <FiUser />
            <Text>Profile</Text>
          </HStack>
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <HStack>
            <FiSettings />
            <Text>Settings</Text>
          </HStack>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <HStack>
            <FiLogOut />
            <Text color="red.500">Sign Out</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default UserMenu
