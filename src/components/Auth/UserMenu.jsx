import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react'
import { FiChevronDown, FiLogOut, FiUser, FiSettings } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const UserMenu = () => {
  const { currentUser, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await logout()
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: 'Error signing out',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FiChevronDown />}
        variant="ghost"
      >
        <HStack spacing={2}>
          <Avatar size="sm" name={currentUser.email} src={currentUser.photoURL} />
          <Text display={{ base: 'none', md: 'block' }}>
            {currentUser.displayName || currentUser.email}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem 
          icon={<FiUser />} 
          onClick={() => navigate(`/profile/${currentUser.uid}`)}
        >
          Profile
        </MenuItem>
        <MenuItem 
          icon={<FiSettings />} 
          onClick={() => navigate('/settings')}
        >
          Settings
        </MenuItem>
        <MenuItem icon={<FiLogOut />} onClick={handleSignOut}>
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default UserMenu
