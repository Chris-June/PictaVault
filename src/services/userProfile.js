import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export const initializeUserProfile = async (userId, email) => {
  const userProfileRef = doc(db, 'userProfiles', userId)
  
  // Check if profile already exists
  const profileDoc = await getDoc(userProfileRef)
  
  if (!profileDoc.exists()) {
    // Create initial profile
    await setDoc(userProfileRef, {
      email,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      location: '',
      bio: '',
      profession: '',
      website: '',
      interests: '',
      phoneNumber: '',
      gender: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
}

export const getUserProfile = async (userId) => {
  const userProfileRef = doc(db, 'userProfiles', userId)
  const profileDoc = await getDoc(userProfileRef)
  
  if (profileDoc.exists()) {
    return profileDoc.data()
  }
  return null
}

export const updateUserProfileData = async (userId, updates) => {
  const userProfileRef = doc(db, 'userProfiles', userId)
  
  try {
    await updateDoc(userProfileRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}
