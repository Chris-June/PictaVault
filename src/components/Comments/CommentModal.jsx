import React, { useState, useEffect, Fragment } from 'react';
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
  HStack,
  Text,
  Input,
  Avatar,
  Box,
  useToast,
  Divider,
  Image,
  useColorModeValue,
  Spinner,
  IconButton,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'
import { addComment, deleteComment, getPostComments } from '../../services/posts'
import { getUserProfile } from '../../services/userProfile'
import { format } from 'date-fns'
import { FiTrash2 } from 'react-icons/fi'

// Safe date formatting helper
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // Handle Firebase Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    }
    // Handle regular Date object or ISO string
    if (timestamp instanceof Date || typeof timestamp === 'string') {
      return format(new Date(timestamp), 'MMM d, yyyy');
    }
    return '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const Comment = ({ comment, postId, onDelete, currentUserId }) => {
  // Extremely defensive rendering
  if (!comment) {
    console.error('No comment provided');
    return null;
  }

  // Ensure all properties exist and are strings
  const safeComment = {
    id: String(comment.id || Date.now()),
    text: String(comment.text || ''),
    userId: String(comment.userId || ''),
    userName: String(comment.userName || 'Anonymous'),
    userPhotoURL: String(comment.userPhotoURL || ''),
    createdAt: comment.createdAt instanceof Date 
      ? comment.createdAt 
      : typeof comment.createdAt?.toDate === 'function'
        ? comment.createdAt.toDate()
        : new Date()
  };

  // Log the safe comment for debugging
  console.log('Rendering safe comment:', JSON.stringify(safeComment, null, 2));

  return (
    <HStack align="start" spacing={3} w="100%">
      <Avatar 
        size="sm" 
        src={safeComment.userPhotoURL} 
        name={safeComment.userName} 
      />
      <Box flex={1}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="sm">
              {safeComment.userName}
            </Text>
            <Text fontSize="sm">{safeComment.text}</Text>
            {safeComment.createdAt && (
              <Text fontSize="xs" color="gray.500">
                {formatDate(safeComment.createdAt)}
              </Text>
            )}
          </VStack>
          {currentUserId === safeComment.userId && (
            <IconButton
              size="sm"
              icon={<FiTrash2 />}
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                console.log('Attempting to delete comment:', safeComment);
                onDelete(safeComment);
              }}
              aria-label="Delete comment"
            />
          )}
        </HStack>
      </Box>
    </HStack>
  );
};

const CommentModal = ({ isOpen, onClose, post, onCommentUpdate }) => {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userId, userEmail, currentUser } = useAuth()
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    let mounted = true;
    
    const loadComments = async () => {
      if (!post?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedComments = await getPostComments(post.id);
        
        if (mounted) {
          // Transform comments to ensure primitive values
          const processedComments = fetchedComments.map(comment => ({
            id: String(comment.id || Date.now()),
            text: String(comment.text || ''),
            userId: String(comment.userId || ''),
            userName: String(comment.userName || 'Anonymous'),
            userPhotoURL: String(comment.userPhotoURL || ''),
            createdAt: comment.createdAt instanceof Date 
              ? comment.createdAt 
              : typeof comment.createdAt?.toDate === 'function'
                ? comment.createdAt.toDate()
                : new Date()
          }));
          
          setComments(processedComments);
        }
      } catch (err) {
        if (mounted) {
          setError(String(err.message));
          setComments([]);
          toast({
            title: 'Error loading comments',
            description: err.message.includes('rate limit') 
              ? 'Too many requests. Please try again later.'
              : 'Failed to load comments',
            status: 'error',
            duration: 5000,
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    if (isOpen) {
      loadComments();
    }

    return () => {
      mounted = false;
    };
  }, [isOpen, post?.id, toast]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      const addedComment = await addComment(post.id, {
        text: newComment.trim(),
        userId,
        userName: currentUser?.displayName || userEmail?.split('@')[0] || 'Anonymous',
        userPhotoURL: currentUser?.photoURL || ''
      });

      const processedComment = {
        id: String(addedComment.id || Date.now()),
        text: String(addedComment.text || ''),
        userId: String(addedComment.userId || ''),
        userName: String(addedComment.userName || 'Anonymous'),
        userPhotoURL: String(addedComment.userPhotoURL || ''),
        createdAt: addedComment.createdAt instanceof Date 
          ? addedComment.createdAt 
          : typeof addedComment.createdAt?.toDate === 'function'
            ? addedComment.createdAt.toDate()
            : new Date()
      };

      setComments(prevComments => [...prevComments, processedComment]);
      setNewComment('');
      
      if (onCommentUpdate) {
        onCommentUpdate();
      }

      toast({
        title: 'Comment added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error adding comment',
        description: error.message.includes('rate limit')
          ? 'Too many comments. Please try again later.'
          : 'Failed to add comment',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    try {
      await deleteComment(post.id, comment.id);
      setComments(prevComments => 
        prevComments.filter(c => c.id !== comment.id)
      );
      
      if (onCommentUpdate) {
        onCommentUpdate();
      }

      toast({
        title: 'Comment deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting comment',
        description: String(error.message),
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalCloseButton />
        
        <HStack h="600px" spacing={0} align="stretch">
          {/* Left side - Image */}
          <Box w="60%" bg="black" position="relative">
            <Image
              src={String(post?.mediaUrl || '')}
              alt={String(post?.caption || '')}
              objectFit="contain"
              w="100%"
              h="100%"
            />
          </Box>

          {/* Right side - Comments */}
          <VStack w="40%" h="100%" spacing={0} align="stretch">
            <ModalHeader borderBottomWidth="1px">Comments</ModalHeader>
            
            <ModalBody 
              flex="1" 
              overflowY="auto" 
              p={4}
            >
              <VStack spacing={6} align="stretch">
                {isLoading ? (
                  <Box textAlign="center" py={4}>
                    <Spinner />
                    <Text mt={2}>Loading comments...</Text>
                  </Box>
                ) : error ? (
                  <Box textAlign="center" py={4}>
                    <Text color="red.500">{String(error)}</Text>
                  </Box>
                ) : !comments || comments.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Text color="gray.500">No comments yet. Be the first to comment!</Text>
                  </Box>
                ) : (
                  <VStack spacing={6} align="stretch">
                    {comments.map(comment => (
                      <Comment
                        key={String(comment.id)}
                        comment={comment}
                        postId={String(post.id)}
                        onDelete={handleDelete}
                        currentUserId={userId}
                      />
                    ))}
                  </VStack>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter
              p={4}
              borderTopWidth="1px"
              borderColor={borderColor}
            >
              <HStack w="100%" spacing={3}>
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  colorScheme="blue"
                  onClick={handleAddComment}
                  isLoading={isSubmitting}
                  loadingText="Posting"
                  isDisabled={!newComment.trim() || !userId}
                >
                  Post
                </Button>
              </HStack>
            </ModalFooter>
          </VStack>
        </HStack>
      </ModalContent>
    </Modal>
  );
};

export default CommentModal
