import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Container,
  Flex,
  FormErrorMessage,
  List,
  ListItem,
  ListIcon,
  Tooltip,
  HStack,
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiCheck, FiX, FiInfo } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const SignIn = ({ onSuccess }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  
  const { signIn, signUp, resetPassword } = useAuth()
  const toast = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const inputBgColor = useColorModeValue('white', 'gray.700')

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  // Password validation
  const validatePassword = (password) => {
    const newErrors = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    setPasswordErrors(newErrors)
    return Object.values(newErrors).every(Boolean)
  }

  // Handle input focus
  const handlePasswordFocus = () => {
    setShowPasswordRules(true)
  }

  // Handle input blur
  const handlePasswordBlur = () => {
    setShowPasswordRules(false)
  }

  // Update password validation on change
  useEffect(() => {
    if (password) {
      validatePassword(password)
    }
  }, [password])

  const handleSignIn = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      toast({
        title: 'Validation Error',
        description: 'Please check your email and password',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      toast({
        title: 'Welcome to PictaVault!',
        description: 'You have successfully signed in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      navigate('/home')
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      toast({
        title: 'Validation Error',
        description: 'Please check your email and password',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
      toast({
        title: 'Welcome to PictaVault!',
        description: 'Account created successfully!',
        status: 'success',
        duration: 3000,
      })
      navigate('/home')
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const isEmailValid = validateEmail(email)
    if (!isEmailValid) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      toast({
        title: 'Success',
        description: 'Password reset email sent! Check your inbox.',
        status: 'success',
        duration: 5000,
      })
      setShowForgotPassword(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container maxW="md" p={0}>
        <Box
          bg={bgColor}
          p={8}
          borderWidth={1}
          borderRadius="lg"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Sign In
            </Text>

            <FormControl isRequired isInvalid={!!emailError}>
              <FormLabel color={textColor}>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  validateEmail(e.target.value)
                }}
                placeholder="Enter your email"
                bg={inputBgColor}
                borderColor={borderColor}
                color={textColor}
                _placeholder={{ color: 'gray.500' }}
              />
              <FormErrorMessage>{emailError}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <HStack spacing={2} align="center">
                <FormLabel color={textColor} mb={0}>Password</FormLabel>
                <Tooltip
                  label={
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Password Requirements:</Text>
                      <Text>• Minimum 8 characters</Text>
                      <Text>• One uppercase letter</Text>
                      <Text>• One lowercase letter</Text>
                      <Text>• One number</Text>
                      <Text>• One special character (!@#$%^&*)</Text>
                    </VStack>
                  }
                  placement="right"
                  hasArrow
                  bg={useColorModeValue('gray.700', 'gray.200')}
                  color={useColorModeValue('white', 'gray.800')}
                >
                  <IconButton
                    icon={<FiInfo />}
                    variant="ghost"
                    size="sm"
                    aria-label="Password requirements"
                    color={useColorModeValue('gray.400', 'gray.500')}
                    _hover={{ color: useColorModeValue('gray.600', 'gray.300') }}
                  />
                </Tooltip>
              </HStack>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  placeholder="Enter your password"
                  bg={inputBgColor}
                  borderColor={borderColor}
                  color={textColor}
                  _placeholder={{ color: 'gray.500' }}
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    color={textColor}
                  />
                </InputRightElement>
              </InputGroup>
              
              <Button
                variant="link"
                size="sm"
                color="blue.500"
                onClick={() => setShowForgotPassword(true)}
                mt={1}
              >
                Forgot Password?
              </Button>

              {showPasswordRules && (
                <Box mt={2} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Text fontSize="sm" mb={2}>Password must contain:</Text>
                  <List spacing={1} fontSize="sm">
                    <ListItem color={passwordErrors.length ? 'green.500' : 'red.500'}>
                      <ListIcon as={passwordErrors.length ? FiCheck : FiX} />
                      At least 8 characters
                    </ListItem>
                    <ListItem color={passwordErrors.uppercase ? 'green.500' : 'red.500'}>
                      <ListIcon as={passwordErrors.uppercase ? FiCheck : FiX} />
                      One uppercase letter
                    </ListItem>
                    <ListItem color={passwordErrors.lowercase ? 'green.500' : 'red.500'}>
                      <ListIcon as={passwordErrors.lowercase ? FiCheck : FiX} />
                      One lowercase letter
                    </ListItem>
                    <ListItem color={passwordErrors.number ? 'green.500' : 'red.500'}>
                      <ListIcon as={passwordErrors.number ? FiCheck : FiX} />
                      One number
                    </ListItem>
                    <ListItem color={passwordErrors.special ? 'green.500' : 'red.500'}>
                      <ListIcon as={passwordErrors.special ? FiCheck : FiX} />
                      One special character
                    </ListItem>
                  </List>
                </Box>
              )}
            </FormControl>

            {showForgotPassword ? (
              <VStack spacing={4}>
                <Text fontSize="sm" color={textColor}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>
                <Button
                  width="full"
                  onClick={handleForgotPassword}
                  isLoading={loading}
                  loadingText="Sending..."
                  colorScheme="blue"
                >
                  Send Reset Link
                </Button>
                <Button
                  width="full"
                  variant="ghost"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Sign In
                </Button>
              </VStack>
            ) : (
              <>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                  loadingText="Signing in..."
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>

                <Text color={textColor} textAlign="center">or</Text>

                <Button
                  width="full"
                  onClick={handleSignUp}
                  isLoading={loading}
                  loadingText="Creating account..."
                  variant="outline"
                  colorScheme="blue"
                >
                  Create Account
                </Button>
              </>
            )}
          </VStack>
        </Box>
      </Container>
    </Flex>
  )
}

export default SignIn
