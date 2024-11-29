import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Upload from './pages/Upload'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import SignIn from './components/Auth/SignIn'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Collections from './pages/Collections'
import CollectionView from './pages/CollectionView'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/auth/signin',
    element: <SignIn />
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Layout>
          <Home />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/collections',
    element: (
      <ProtectedRoute>
        <Layout>
          <Collections />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/collections/:collectionId',
    element: (
      <ProtectedRoute>
        <Layout>
          <CollectionView />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile/:userId',
    element: (
      <ProtectedRoute>
        <Layout>
          <Profile />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/upload',
    element: (
      <ProtectedRoute>
        <Layout>
          <Upload />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          <Settings />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
])

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default App
