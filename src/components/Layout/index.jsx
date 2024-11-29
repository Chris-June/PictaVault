import { Box } from '@chakra-ui/react'
import Header from '../Header'

const Layout = ({ children }) => {
  return (
    <Box minH="100vh">
      <Header />
      <Box as="main">
        {children}
      </Box>
    </Box>
  )
}

export default Layout
