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
  Box,
  Image,
  useToast,
  Spinner,
  RadioGroup,
  Radio,
  Input,
  Textarea,
  Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import { generateCaptions } from '../../services/captionGeneration'

const CaptionSuggestionModal = ({
  isOpen,
  onClose,
  imageUrl,
  onSelectCaption,
  initialCaption = '',
}) => {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedCaption, setSelectedCaption] = useState(initialCaption)
  const [customCaption, setCustomCaption] = useState(initialCaption)
  const [imageDescription, setImageDescription] = useState('')
  const toast = useToast()

  const handleGenerateCaptions = async () => {
    if (!imageDescription.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide a brief description of your photo.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setLoading(true)
      const captions = await generateCaptions(imageDescription)
      setSuggestions(captions)
      setSelectedCaption(captions[0])
    } catch (error) {
      console.error('Error generating captions:', error)
      toast({
        title: 'Error generating captions',
        description: error.message || 'Failed to generate captions. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCaption = () => {
    const finalCaption = selectedCaption === 'custom' ? customCaption : selectedCaption
    onSelectCaption(finalCaption)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Generate Creative Captions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {imageUrl && (
              <Box>
                <Image
                  src={imageUrl}
                  alt="Upload preview"
                  maxH="200px"
                  w="100%"
                  objectFit="cover"
                  borderRadius="md"
                />
              </Box>
            )}

            <Box>
              <Text mb={2} fontWeight="medium">Describe your photo</Text>
              <Textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="E.g., A sunset over mountains with orange and purple sky, reflecting in a calm lake"
                rows={3}
              />
            </Box>

            {!suggestions.length && !loading && (
              <Button
                onClick={handleGenerateCaptions}
                colorScheme="blue"
                isLoading={loading}
                leftIcon={<Text>✨</Text>}
                isDisabled={!imageDescription.trim()}
              >
                Generate Creative Captions
              </Button>
            )}

            {loading && (
              <VStack py={4}>
                <Spinner />
                <Text>Crafting creative captions for your photo...</Text>
              </VStack>
            )}

            {suggestions.length > 0 && (
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">Choose a caption:</Text>
                  <Button
                    size="sm"
                    onClick={handleGenerateCaptions}
                    leftIcon={<Text>🔄</Text>}
                    variant="outline"
                    colorScheme="blue"
                    isLoading={loading}
                  >
                    Regenerate
                  </Button>
                </Flex>
                <RadioGroup value={selectedCaption} onChange={setSelectedCaption}>
                  <VStack align="stretch" spacing={3}>
                    {suggestions.map((suggestion, index) => (
                      <Radio key={index} value={suggestion}>
                        {suggestion}
                      </Radio>
                    ))}
                    <Radio value="custom">Custom caption</Radio>
                  </VStack>
                </RadioGroup>

                {selectedCaption === 'custom' && (
                  <Input
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder="Write your own caption..."
                  />
                )}
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSaveCaption}
            isDisabled={!selectedCaption || (selectedCaption === 'custom' && !customCaption.trim())}
          >
            Use Caption
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CaptionSuggestionModal
