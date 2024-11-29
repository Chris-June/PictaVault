import { useState, useEffect } from 'react'
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  useColorModeValue,
  Tag,
  Wrap,
  WrapItem,
  Icon,
  Flex
} from '@chakra-ui/react'
import { FiHeart, FiMessageCircle, FiShare2, FiMoreVertical, FiEdit2, FiTrash2, FiInfo } from 'react-icons/fi'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { toggleLike } from '../../services/posts'
import MediaDetailsModal from '../Media/MediaDetailsModal'
import CommentModal from '../Comments/CommentModal'
import { getDoc, doc } from 'firebase/firestore/lite'
import { db } from '../../services/firebase'

// Safe date component with error boundary
const SafeDate = ({ date }) => {
  try {
    if (!date) {
      return <Box as="span" fontSize="xs" color="gray.500">Just now</Box>;
    }

    let formattedDate;
    let tooltipDate;

    // Handle Firebase Timestamp
    if (date && typeof date.toDate === 'function') {
      const jsDate = date.toDate();
      formattedDate = format(jsDate, 'MMM d');
      tooltipDate = format(jsDate, 'PPP');
    }
    // Handle Date object
    else if (date instanceof Date) {
      formattedDate = format(date, 'MMM d');
      tooltipDate = format(date, 'PPP');
    }
    // Fallback
    else {
      return <Box as="span" fontSize="xs" color="gray.500">Just now</Box>;
    }

    return (
      <Tooltip label={tooltipDate}>
        <Box as="span" fontSize="xs" color="gray.500">
          {formattedDate}
        </Box>
      </Tooltip>
    );
  } catch (error) {
    console.error('Error rendering date:', error, 'Date value:', date);
    return <Box as="span" fontSize="xs" color="gray.500">Just now</Box>;
  }
};

const MediaCard = ({ post, isProfile, onDelete, onUpdate }) => {
  // Initialize state with safe defaults
  const [postState, setPostState] = useState({
    ...post,
    comments: [],
    likes: 0,
    likedBy: [],
    createdAt: post.createdAt || new Date()
  })
  const [isHovered, setIsHovered] = useState(false)
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const { isOpen: isCommentsOpen, onOpen: onCommentsOpen, onClose: onCommentsClose } = useDisclosure()
  const { currentUser } = useAuth()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Update state when post changes
  useEffect(() => {
    if (post) {
      setPostState(prevState => ({
        ...post,
        comments: Array.isArray(post.comments) ? post.comments : [],
        likes: post.likes || 0,
        likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
        createdAt: post.createdAt || prevState.createdAt
      }))
    }
  }, [post])

  // Check if the current user has liked the post
  const [isLiked, setIsLiked] = useState(false)
  
  useEffect(() => {
    if (postState.likedBy && currentUser) {
      setIsLiked(postState.likedBy.includes(currentUser.uid))
    }
  }, [postState.likedBy, currentUser])

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to like posts',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    try {
      const newLikeState = await toggleLike(postState.id, currentUser.uid)
      setIsLiked(newLikeState)
      
      // Update the post in the parent component
      if (onUpdate) {
        onUpdate({
          ...postState,
          likes: newLikeState ? (postState.likes || 0) + 1 : (postState.likes || 0) - 1,
          likedBy: newLikeState 
            ? [...(postState.likedBy || []), currentUser.uid]
            : (postState.likedBy || []).filter(id => id !== currentUser.uid)
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const refreshPost = async () => {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postState.id));
      if (postDoc.exists()) {
        setPostState({ id: postDoc.id, ...postDoc.data() });
      }
    } catch (error) {
      console.error('Error refreshing post:', error);
    }
  };

  const handleCommentUpdate = async () => {
    try {
      const postRef = doc(db, 'posts', postState.id)
      const postDoc = await getDoc(postRef)
      
      if (postDoc.exists()) {
        const updatedPost = postDoc.data()
        setPostState(prevState => ({
          ...prevState,
          comments: Array.isArray(updatedPost.comments) ? updatedPost.comments : [],
          commentsCount: updatedPost.commentsCount || 0
        }))
        
        // Notify parent component
        if (onUpdate) {
          onUpdate({
            ...postState,
            comments: Array.isArray(updatedPost.comments) ? updatedPost.comments : [],
            commentsCount: updatedPost.commentsCount || 0
          })
        }
      }
    } catch (error) {
      console.error('Error updating comments:', error)
      toast({
        title: 'Error',
        description: 'Failed to update comments',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <>
      <Box
        position="relative"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box 
          position="relative" 
          paddingTop="100%" 
          overflow="hidden"
          cursor="pointer"
          onClick={onCommentsOpen}
          role="button"
          aria-label="View comments"
          _hover={{
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: 'blackAlpha.200',
              transition: 'all 0.2s'
            }
          }}
        >
          <Image
            src={postState.mediaUrl}
            alt={postState.caption || 'Uploaded media'}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
            fallback={
              <Box
                width="100%"
                height="100%"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500">Image loading...</Text>
              </Box>
            }
            onError={(e) => {
              console.error('Image load error:', e);
            }}
          />
          
          {/* Overlay with comment and like counts */}
          {isHovered && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.400"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              transition="all 0.2s"
            >
              <HStack spacing={6}>
                <VStack spacing={1}>
                  <FiHeart size="24px" />
                  <Text fontWeight="bold">{postState.likes || 0}</Text>
                </VStack>
                <VStack spacing={1}>
                  <FiMessageCircle size="24px" />
                  <Text fontWeight="bold">{postState.comments?.length || 0}</Text>
                </VStack>
              </HStack>
            </Box>
          )}
        </Box>

        {isProfile && isHovered && (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="blackAlpha.600"
            borderRadius="md"
          >
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: 'blackAlpha.700' }}
              />
              <MenuList>
                <MenuItem icon={<FiEdit2 />} onClick={onDetailsOpen}>
                  Edit Details
                </MenuItem>
                <MenuItem 
                  icon={<FiTrash2 />} 
                  color="red.500"
                  onClick={() => onDelete && onDelete(postState.id)}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        )}

        <VStack p={4} align="stretch" spacing={3}>
          <Text fontSize="sm" noOfLines={2}>
            {postState.caption}
          </Text>

          <HStack justify="space-between">
            <HStack spacing={2}>
              <Tooltip label="Like">
                <IconButton
                  icon={<FiHeart fill={isLiked ? 'red' : 'none'} />}
                  aria-label="Like"
                  variant="ghost"
                  size="sm"
                  color={isLiked ? 'red.500' : undefined}
                  onClick={handleLike}
                />
              </Tooltip>
              <Tooltip label="Comments">
                <IconButton
                  icon={<FiMessageCircle />}
                  aria-label="Comment"
                  variant="ghost"
                  size="sm"
                  onClick={onCommentsOpen}
                />
              </Tooltip>
            </HStack>

            <Text fontSize="xs" color="gray.500">
              <SafeDate date={postState.createdAt} />
            </Text>
          </HStack>

          {/* Like and comment counts */}
          <HStack spacing={4} fontSize="sm">
            <Text fontWeight="bold">
              {postState.likes || 0} {postState.likes === 1 ? 'like' : 'likes'}
            </Text>
            <Text 
              fontWeight="bold" 
              cursor="pointer" 
              onClick={onCommentsOpen}
              _hover={{ textDecoration: 'underline' }}
            >
              {(Array.isArray(postState.comments) ? postState.comments.length : 0)} {(Array.isArray(postState.comments) && postState.comments.length === 1) ? 'comment' : 'comments'}
            </Text>
          </HStack>

          {postState.tags && postState.tags.length > 0 && (
            <Box p={4}>
              <Flex align="center" mb={2}>
                <Text fontSize="sm" color="gray.500" mr={2}>Tags</Text>
                <Tooltip
                  label="Click on a tag to see similar posts. Words in your post are automatically converted to tags."
                  placement="top"
                  hasArrow
                >
                  <Box display="inline-block">
                    <Icon as={FiInfo} color="gray.500" cursor="pointer" fontSize="sm" />
                  </Box>
                </Tooltip>
              </Flex>
              <Wrap spacing={2}>
                {postState.tags.map((tag, index) => (
                  <WrapItem key={index}>
                    <Tag
                      size="sm"
                      colorScheme="blue"
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove # for search if it exists
                        const searchTag = tag.startsWith('#') ? tag : `#${tag}`;
                        window.location.href = `/?search=${encodeURIComponent(searchTag)}`;
                      }}
                    >
                      {tag}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}
        </VStack>
      </Box>

      <MediaDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        media={postState}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />

      <CommentModal
        isOpen={isCommentsOpen}
        onClose={onCommentsClose}
        post={{
          ...postState,
          comments: Array.isArray(postState.comments) 
            ? postState.comments.map(comment => ({
                id: comment.id || '',
                text: String(comment.text || ''),
                userId: comment.userId || '',
                userName: comment.userName || 'Anonymous',
                userPhotoURL: comment.userPhotoURL || '',
                createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date()
              }))
            : []
        }}
        onCommentUpdate={handleCommentUpdate}
      />
    </>
  )
}

export default MediaCard
