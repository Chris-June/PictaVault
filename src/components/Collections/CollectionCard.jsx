import { useState } from 'react'
import {
  Box,
  Image,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Badge,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { MoreVertical, Edit, Trash, Lock, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { deleteCollection } from '../../services/collections'
import EditCollectionModal from './EditCollectionModal'

const CollectionCard = ({ collection, onUpdate, onDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        setIsDeleting(true)
        await deleteCollection(collection.id)
        onDelete(collection.id)
      } catch (error) {
        console.error('Error deleting collection:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <Box
        as={Link}
        to={`/collections/${collection.id}`}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        position="relative"
      >
        {/* Collection Cover */}
        <Box h="200px" bg="gray.100" position="relative">
          {collection.coverImage ? (
            <Image
              src={collection.coverImage}
              alt={collection.name}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              h="100%"
              color="gray.400"
            >
              <ImageIcon size={48} />
            </Box>
          )}
        </Box>

        {/* Collection Info */}
        <Box p={4}>
          <HStack justify="space-between" align="start" mb={2}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold" fontSize="lg" noOfLines={1}>
                {collection.name}
              </Text>
              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                {collection.description}
              </Text>
            </VStack>

            {/* Menu Button */}
            <Box
              onClick={(e) => e.preventDefault()}
              position="absolute"
              top={2}
              right={2}
            >
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<MoreVertical size={16} />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  bg="blackAlpha.600"
                  _hover={{ bg: 'blackAlpha.700' }}
                />
                <MenuList>
                  <MenuItem icon={<Edit size={16} />} onClick={onOpen}>
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<Trash size={16} />}
                    onClick={handleDelete}
                    isDisabled={isDeleting}
                    color="red.500"
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </HStack>

          {/* Collection Stats */}
          <HStack spacing={4} mt={2}>
            <Text fontSize="sm" color="gray.500">
              {collection.mediaCount} items
            </Text>
            {collection.isPrivate && (
              <Badge colorScheme="purple" display="flex" alignItems="center" gap={1}>
                <Lock size={12} />
                Private
              </Badge>
            )}
          </HStack>
        </Box>
      </Box>

      <EditCollectionModal
        isOpen={isOpen}
        onClose={onClose}
        collection={collection}
        onUpdate={onUpdate}
      />
    </>
  )
}

export default CollectionCard
