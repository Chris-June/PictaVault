import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  useToast,
  Box,
  SimpleGrid,
  Spinner,
  IconButton,
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getUserCollections, addToCollection } from '../../services/collections'
import CollectionCard from './CollectionCard'

const AddToCollectionModal = ({ isOpen, onClose, mediaId }) => {
  const { user } = useAuth()
  const toast = useToast()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const { collections } = await getUserCollections({
          userId: user.uid,
          pageSize: 100 // Fetch more collections for this view
        })
        setCollections(collections)
      } catch (error) {
        console.error('Error fetching collections:', error)
        toast({
          title: 'Error loading collections',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen, user, toast])

  const handleAddToCollection = async (collectionId) => {
    try {
      setAdding(true)
      await addToCollection(collectionId, mediaId)
      toast({
        title: 'Added to collection',
        status: 'success',
        duration: 2000,
      })
      onClose()
    } catch (error) {
      console.error('Error adding to collection:', error)
      toast({
        title: 'Error adding to collection',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>Add to Collection</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {loading ? (
            <Box textAlign="center" py={8}>
              <Spinner />
            </Box>
          ) : collections.length === 0 ? (
            <VStack py={8} spacing={4}>
              <Text>You don't have any collections yet.</Text>
              <Button
                as="a"
                href="/collections"
                colorScheme="purple"
                onClick={onClose}
              >
                Create Collection
              </Button>
            </VStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} pb={4}>
              {collections.map(collection => (
                <Box
                  key={collection.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  position="relative"
                  _hover={{ bg: 'gray.50' }}
                >
                  <VStack align="start">
                    <Text fontWeight="semibold">{collection.name}</Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {collection.description}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {collection.mediaCount} items
                    </Text>
                  </VStack>
                  
                  <IconButton
                    icon={<Plus size={20} />}
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme="purple"
                    size="sm"
                    isLoading={adding}
                    onClick={() => handleAddToCollection(collection.id)}
                  />
                </Box>
              ))}
            </SimpleGrid>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddToCollectionModal
