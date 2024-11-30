import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const MemoryCard = ({ memory }) => {
  const { currentUser } = useAuth()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast({
      title: 'Edit functionality coming soon',
      status: 'info',
      duration: 2000,
    })
  }

  const handleDelete = () => {
    // TODO: Implement delete functionality
    toast({
      title: 'Delete functionality coming soon',
      status: 'info',
      duration: 2000,
    })
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="md"
      transition="all 0.2s"
      _hover={{ shadow: 'lg' }}
    >
      <Image
        src={memory.imageUrl}
        alt={memory.title}
        objectFit="cover"
        w="100%"
        h="200px"
      />
      
      <VStack p={4} align="stretch" spacing={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="lg">
              {memory.title}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {format(new Date(memory.date), 'MMM d, yyyy')}
            </Text>
          </VStack>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              aria-label="Options"
            />
            <MenuList>
              <MenuItem icon={<FiEdit2 />} onClick={handleEdit}>
                Edit
              </MenuItem>
              <MenuItem icon={<FiTrash2 />} onClick={handleDelete} color="red.500">
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        <Text noOfLines={2} color="gray.600">
          {memory.description}
        </Text>
      </VStack>
    </Box>
  )
}

export default MemoryCard
