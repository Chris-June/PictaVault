import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  IconButton,
  HStack,
  Button,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from '@chakra-ui/react'
import { ArrowLeft, MoreVertical, Edit, Trash, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCollectionMedia, deleteCollection } from '../services/collections'
import MediaCard from '../components/MediaCard'
import EditCollectionModal from '../components/Collections/EditCollectionModal'
import { useDisclosure } from '@chakra-ui/react'

const CollectionView = () => {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [collection, setCollection] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMedia = useCallback(async () => {
    if (!collectionId || loading || !hasMore) return

    try {
      setLoading(true)
      const { media: newMedia, lastVisible } = await getCollectionMedia({
        collectionId,
        lastDoc: lastDocRef.current
      })

      if (newMedia.length < 20) {
        setHasMore(false)
      }

      setMedia(prev => 
        lastDocRef.current 
          ? [...prev, ...newMedia]
          : newMedia
      )
      
      lastDocRef.current = lastVisible
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error loading media',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }, [collectionId, loading, hasMore, toast])

  // Initial fetch
  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      fetchMedia()
    }
  }, [fetchMedia])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        setIsDeleting(true)
        await deleteCollection(collectionId)
        toast({
          title: 'Collection deleted',
          status: 'success',
          duration: 3000,
        })
        navigate('/collections')
      } catch (error) {
        console.error('Error deleting collection:', error)
        toast({
          title: 'Error deleting collection',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCollectionUpdate = (updatedCollection) => {
    setCollection(updatedCollection)
  }

  if (!collection) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading collection...</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <HStack justify="space-between" align="start" mb={6}>
          <HStack spacing={4}>
            <IconButton
              icon={<ArrowLeft />}
              onClick={() => navigate('/collections')}
              variant="ghost"
            />
            <Box>
              <HStack mb={2}>
                <Heading size="lg">{collection.name}</Heading>
                {collection.isPrivate && (
                  <Badge colorScheme="purple" display="flex" alignItems="center" gap={1}>
                    <Lock size={12} />
                    Private
                  </Badge>
                )}
              </HStack>
              <Text color="gray.500">{collection.description}</Text>
            </Box>
          </HStack>

          <Menu>
            <MenuButton
              as={IconButton}
              icon={<MoreVertical size={16} />}
              variant="ghost"
            />
            <MenuList>
              <MenuItem icon={<Edit size={16} />} onClick={onOpen}>
                Edit Collection
              </MenuItem>
              <MenuItem
                icon={<Trash size={16} />}
                onClick={handleDelete}
                isDisabled={isDeleting}
                color="red.500"
              >
                Delete Collection
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {media.length === 0 && !loading ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500">
              No media in this collection yet.
            </Text>
            <Button
              colorScheme="purple"
              variant="outline"
              mt={4}
              onClick={() => navigate('/upload')}
            >
              Add Media
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {media.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                onDelete={(deletedId) => {
                  setMedia(prev =>
                    prev.filter(m => m.id !== deletedId)
                  )
                }}
              />
            ))}
          </SimpleGrid>
        )}

        {loading && (
          <Box textAlign="center" py={4}>
            <Text>Loading more media...</Text>
          </Box>
        )}
      </Box>

      <EditCollectionModal
        isOpen={isOpen}
        onClose={onClose}
        collection={collection}
        onUpdate={handleCollectionUpdate}
      />
    </Container>
  )
}

export default CollectionView
