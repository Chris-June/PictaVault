import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Button,
  SimpleGrid,
  useDisclosure,
  VStack,
  Text,
  Container,
  Heading,
  useToast
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserCollections } from '../services/collections'
import CollectionCard from '../components/Collections/CollectionCard'
import CreateCollectionModal from '../components/Collections/CreateCollectionModal'

const Collections = () => {
  const { user } = useAuth()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef(null)

  const fetchCollections = useCallback(async () => {
    if (!user || loading || !hasMore) return

    try {
      setLoading(true)
      const { collections: newCollections, lastVisible } = await getUserCollections({
        userId: user.uid,
        lastDoc: lastDocRef.current
      })

      if (newCollections.length < 12) {
        setHasMore(false)
      }

      setCollections(prev => 
        lastDocRef.current 
          ? [...prev, ...newCollections]
          : newCollections
      )
      
      lastDocRef.current = lastVisible
    } catch (error) {
      console.error('Error fetching collections:', error)
      toast({
        title: 'Error fetching collections',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [user, loading, hasMore, toast])

  // Initial fetch
  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      fetchCollections()
    }
  }, [fetchCollections])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleCollectionCreated = (newCollection) => {
    setCollections(prev => [newCollection, ...prev])
    onClose()
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">My Collections</Heading>
          <Button
            leftIcon={<Plus />}
            colorScheme="purple"
            onClick={onOpen}
          >
            New Collection
          </Button>
        </Box>

        {collections.length === 0 && !loading ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500">
              No collections yet. Create your first collection to organize your media!
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {collections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onUpdate={(updatedCollection) => {
                  setCollections(prev =>
                    prev.map(c =>
                      c.id === updatedCollection.id ? updatedCollection : c
                    )
                  )
                }}
                onDelete={(deletedId) => {
                  setCollections(prev =>
                    prev.filter(c => c.id !== deletedId)
                  )
                }}
              />
            ))}
          </SimpleGrid>
        )}

        {loading && (
          <Box textAlign="center" py={4}>
            <Text>Loading more collections...</Text>
          </Box>
        )}
      </VStack>

      <CreateCollectionModal
        isOpen={isOpen}
        onClose={onClose}
        onCollectionCreated={handleCollectionCreated}
      />
    </Container>
  )
}

export default Collections
