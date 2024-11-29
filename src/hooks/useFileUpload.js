import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  const uploadFile = async (file) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to upload files')
    }

    try {
      setUploading(true)
      setError(null)

      // Create a unique filename using timestamp and original extension
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}.${fileExtension}`
      
      // Create reference to user's media folder
      const storageRef = ref(storage, `media/${currentUser.uid}/${fileName}`)
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file)
      console.log('Uploaded file:', snapshot)

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log('File available at:', downloadURL)

      return {
        url: downloadURL,
        path: `media/${currentUser.uid}/${fileName}`,
        fileName,
        contentType: file.type,
        size: file.size
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadFile,
    uploading,
    error
  }
}
