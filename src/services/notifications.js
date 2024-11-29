import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Initialize notification settings for a user
export const initializeNotificationSettings = async (userId) => {
  const settingsRef = doc(db, 'userSettings', userId)
  const settingsDoc = await getDoc(settingsRef)

  if (!settingsDoc.exists()) {
    await setDoc(settingsRef, {
      notifications: {
        email: true,
        push: true,
        preferences: {
          likes: true,
          comments: true,
          follows: true,
          mentions: true
        }
      },
      updatedAt: new Date().toISOString()
    })
  }
}

// Get user's notification settings
export const getNotificationSettings = async (userId) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId)
    const settingsDoc = await getDoc(settingsRef)

    if (!settingsDoc.exists()) {
      await initializeNotificationSettings(userId)
      return {
        email: true,
        push: true,
        preferences: {
          likes: true,
          comments: true,
          follows: true,
          mentions: true
        }
      }
    }

    return settingsDoc.data().notifications
  } catch (error) {
    console.error('Error getting notification settings:', error)
    throw error
  }
}

// Update user's notification settings
export const updateNotificationSettings = async (userId, settings) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId)
    await updateDoc(settingsRef, {
      notifications: settings,
      updatedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error updating notification settings:', error)
    throw error
  }
}

// Request push notification permission
export const requestPushPermission = async () => {
  try {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support push notifications')
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Error requesting push permission:', error)
    throw error
  }
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async (userId) => {
  try {
    const permission = await requestPushPermission()
    if (!permission) {
      throw new Error('Push notification permission denied')
    }

    // Here you would typically:
    // 1. Get the FCM token
    // 2. Send it to your server
    // 3. Save it in Firestore
    // For now, we'll just update the settings
    const settingsRef = doc(db, 'userSettings', userId)
    await updateDoc(settingsRef, {
      'notifications.push': true,
      updatedAt: new Date().toISOString()
    })

    return true
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    throw error
  }
}

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (userId) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId)
    await updateDoc(settingsRef, {
      'notifications.push': false,
      updatedAt: new Date().toISOString()
    })

    return true
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    throw error
  }
}
