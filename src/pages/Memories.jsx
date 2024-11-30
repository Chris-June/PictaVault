import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  useToast,
  Button,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { FiCalendar, FiFilter, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import MemoryCard from '../components/Memories/MemoryCard'
import { getMemories } from '../services/memories'
import CreateMemoryModal from '../components/Memories/CreateMemoryModal'

const Memories = () => {
  const { currentUser } = useAuth()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const toast = useToast()

  useEffect(() => {
    loadMemories()
  }, [currentUser])

  const loadMemories = async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      const { memories: loadedMemories } = await getMemories({ 
        userId: currentUser.uid,
        pageSize: 20
      })
      setMemories(loadedMemories)
    } catch (error) {
      console.error('Error loading memories:', error)
      setError(error.message)
      toast({
        title: 'Error loading memories',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMemory = async (newMemory) => {
    setMemories(prev => [newMemory, ...prev])
    setIsCreateModalOpen(false)
    toast({
      title: 'Memory created',
      status: 'success',
      duration: 3000,
    })
  }

  const sortedMemories = [...memories].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date)
    }
    return 0
  })

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">My Memories</Heading>
          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />} leftIcon={<FiFilter />} variant="outline">
                Sort by
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setSortBy('date')}>
                  <Icon as={FiCalendar} mr={2} />
                  Date
                </MenuItem>
              </MenuList>
            </Menu>
            <Button colorScheme="blue" onClick={() => setIsCreateModalOpen(true)}>
              Create Memory
            </Button>
          </HStack>
        </HStack>

        {loading ? (
          <Text>Loading memories...</Text>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : memories.length === 0 ? (
          <VStack py={8} spacing={4}>
            <Text>No memories yet. Start creating your first memory!</Text>
            <Button colorScheme="blue" onClick={() => setIsCreateModalOpen(true)}>
              Create Memory
            </Button>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {sortedMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <CreateMemoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMemory={handleCreateMemory}
      />
    </Container>
  )
}

export default Memories
