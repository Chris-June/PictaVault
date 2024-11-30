import { createContext, useContext, useState, useEffect, startTransition } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { initializeUserProfile, updateUserProfileData } from '../services/userProfile'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const signUp = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await initializeUserProfile(userCredential.user.uid, email)
    return userCredential
  }

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = () => {
    return firebaseSignOut(auth)
  }

  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email)
  }

  const updateUserProfile = async (updates) => {
    if (!auth.currentUser) throw new Error('No user signed in')
    
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, updates)
      
      // Update Firestore profile data
      await updateUserProfileData(auth.currentUser.uid, updates)
      
      startTransition(() => {
        // Update local state
        setCurrentUser(prev => ({
          ...prev,
          displayName: updates.displayName || prev.displayName,
          photoURL: updates.photoURL || prev.photoURL
        }))
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      startTransition(() => {
        if (user) {
          // Convert user object to simple primitive values
          setCurrentUser({
            uid: String(user.uid || ''),
            email: String(user.email || ''),
            displayName: String(user.displayName || ''),
            photoURL: String(user.photoURL || '')
          })
        } else {
          setCurrentUser(null)
        }
        setLoading(false)
      })
    })

    return unsubscribe
  }, [])

  // Create a safe value object with only primitive values
  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    userId: currentUser?.uid || '',
    userEmail: currentUser?.email || '',
    userName: currentUser?.displayName || '',
    userPhoto: currentUser?.photoURL || '',
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
