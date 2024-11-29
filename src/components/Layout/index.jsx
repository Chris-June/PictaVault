import { Box } from '@chakra-ui/react'
import Navbar from '../Navbar'

const Layout = ({ children }) => {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box as="main" pt="72px">
        {children}
      </Box>
    </Box>
  )
}

export default Layout
