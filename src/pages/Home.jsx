import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  SimpleGrid,
  Input,
  Select,
  HStack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  Tooltip,
  Icon
} from '@chakra-ui/react'
import { FiSearch, FiInfo } from 'react-icons/fi'
import MediaCard from '../components/MediaCard/index'
import { getAllPosts } from '../services/posts'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filteredPosts, setFilteredPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const fetchedPosts = await getAllPosts({ 
          searchQuery: searchQuery,
          sortBy: sortBy 
        })
        setFilteredPosts(fetchedPosts)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [searchQuery, sortBy])

  const handleSearch = (value) => {
    setSearchQuery(value)
  }

  const searchBgColor = useColorModeValue('white', 'gray.800')
  const searchPlaceholderColor = useColorModeValue('gray.400', 'gray.500')
  const searchBorderColor = useColorModeValue('gray.200', 'gray.600')

  if (loading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} width="100%">
        <HStack width="100%" spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FiSearch color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder='Search posts or type words to find tags...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              bg={searchBgColor}
              borderColor={searchBorderColor}
              _placeholder={{ color: searchPlaceholderColor }}
            />
            <InputRightElement width="4.5rem">
              <Tooltip
                label="Add words to your post to automatically create tags. Example: 'Beautiful nature' creates tags #beautiful #nature"
                placement="top"
                hasArrow
              >
                <Box display="inline-block">
                  <Icon as={FiInfo} color="gray.500" cursor="pointer" />
                </Box>
              </Tooltip>
            </InputRightElement>
          </InputGroup>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            bg={searchBgColor}
            borderColor={searchBorderColor}
            width="auto"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostLiked">Most Liked</option>
            <option value="leastLiked">Least Liked</option>
          </Select>
        </HStack>

        {/* Media Grid */}
        {filteredPosts.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color="gray.500" fontSize="lg">
              {searchQuery 
                ? "No memories found matching your search."
                : "No memories have been shared yet. Be the first to share!"}
            </Text>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            width="100%"
          >
            {filteredPosts.map((post) => (
              <MediaCard key={post.id} post={post} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  )
}

export default Home
