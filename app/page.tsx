'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import FileUploader from '../components/FileUploader'
import UploadHistory from '../components/UploadHistory'

// Define the upload record type
interface UploadRecord {
  path: string
  folder: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

export default function Home() {
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Load upload history from localStorage
    const storedHistory = localStorage.getItem('uploadHistory')
    if (storedHistory) {
      setUploadHistory(JSON.parse(storedHistory))
    }
  }, [])

  const handleUploadSuccess = (uploadRecord: UploadRecord) => {
    const updatedHistory = [uploadRecord, ...uploadHistory]
    if (updatedHistory.length > 100) {
      updatedHistory.splice(100)
    }
    setUploadHistory(updatedHistory)
    localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          Supabase File Upload System
        </h1>
        
        <FileUploader onUploadSuccess={handleUploadSuccess} />
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:translate-y-[-2px] transition-all"
        >
          {showHistory ? 'Hide Upload History' : 'View Upload History'}
        </button>
        
        {showHistory && (
          <UploadHistory 
            history={uploadHistory} 
            onClose={() => setShowHistory(false)} 
          />
        )}
      </div>
      
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[40px] animate-spotlight" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[50px] animate-spotlight2" />
      </div>
    </main>
  )
}
