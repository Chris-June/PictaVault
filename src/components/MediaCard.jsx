import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  AspectRatio,
  useToast
} from '@chakra-ui/react'
import { FiHeart, FiMessageCircle, FiTrash2 } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updatePost, deletePost } from '../services/posts'
import { format } from 'date-fns'

const MediaCard = ({ post }) => {
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { userId } = useAuth()
  const toast = useToast()

  // Convert post data to safe format
  const safePost = {
    id: String(post?.id || ''),
    mediaUrl: String(post?.mediaUrl || ''),
    mediaType: String(post?.mediaType || 'image'),
    caption: String(post?.caption || ''),
    userId: String(post?.userId || ''),
    likes: Number(post?.likes || 0),
    comments: Number(post?.comments || 0),
    createdAt: post?.createdAt ? new Date(post.createdAt) : new Date()
  }

  const handleLike = async () => {
    if (!userId) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to like posts',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setIsLiking(true)
      await updatePost(safePost.id, { likes: safePost.likes + 1 })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not like the post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!userId || userId !== safePost.userId) return

    try {
      setIsDeleting(true)
      await deletePost(safePost.id)
      toast({
        title: 'Post deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not delete the post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Box borderWidth={1} borderRadius="lg" overflow="hidden">
      <AspectRatio ratio={1}>
        {safePost.mediaType === 'video' ? (
          <video
            src={safePost.mediaUrl}
            controls
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Image
            src={safePost.mediaUrl}
            alt={safePost.caption}
            objectFit="cover"
          />
        )}
      </AspectRatio>

      <VStack p={4} align="stretch" spacing={3}>
        <Text noOfLines={2}>{safePost.caption}</Text>
        
        <HStack justify="space-between">
          <HStack spacing={4}>
            <IconButton
              icon={<FiHeart />}
              aria-label="Like"
              variant="ghost"
              isLoading={isLiking}
              onClick={handleLike}
            />
            <Text fontSize="sm">{String(safePost.likes || 0)}</Text>
            
            <IconButton
              icon={<FiMessageCircle />}
              aria-label="Comment"
              variant="ghost"
            />
            <Text fontSize="sm">{String(safePost.comments || 0)}</Text>
          </HStack>

          {userId === safePost.userId && (
            <IconButton
              icon={<FiTrash2 />}
              aria-label="Delete post"
              variant="ghost"
              colorScheme="red"
              isLoading={isDeleting}
              onClick={handleDelete}
            />
          )}
        </HStack>

        <Text fontSize="xs" color="gray.500">
          {format(safePost.createdAt, 'PPp')}
        </Text>
      </VStack>
    </Box>
  )
}

export default MediaCard
