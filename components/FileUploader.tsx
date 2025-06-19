'use client'

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { createClient } from '../utils/supabase/client'

// File type mapping for folder organization
const fileTypeMap: Record<string, string> = {
  // Documents
  'pdf': 'documents',
  'doc': 'documents',
  'docx': 'documents',
  'txt': 'documents',
  'rtf': 'documents',
  
  // Spreadsheets
  'csv': 'spreadsheets',
  'xls': 'spreadsheets',
  'xlsx': 'spreadsheets',
  
  // Web
  'html': 'web',
  'htm': 'web',
  'css': 'web',
  'js': 'web',
  'jsx': 'web',
  'tsx': 'web',
  
  // Images
  'jpg': 'images',
  'jpeg': 'images',
  'png': 'images',
  'gif': 'images',
  'svg': 'images',
  'webp': 'images',
  
  // Audio
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  'm4a': 'audio',
  
  // Video
  'mp4': 'video',
  'mov': 'video',
  'avi': 'video',
  'webm': 'video',
  
  // Code
  'json': 'code',
  'xml': 'code',
  'py': 'code',
  'java': 'code',
  'c': 'code',
  'cpp': 'code',
  'cs': 'code',
  'php': 'code',
  'rb': 'code',
  'go': 'code',
  'rs': 'code',
  'ts': 'code',
  
  // Version control
  'git': 'version-control',
  'gitignore': 'version-control',
  
  // Archives
  'zip': 'archives',
  'rar': 'archives',
  'tar': 'archives',
  'gz': 'archives',
  '7z': 'archives',
}

interface FileUploaderProps {
  onUploadSuccess: (uploadRecord: any) => void
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [uploadResult, setUploadResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatusMessage('')
      setUploadResult(null)
    }
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setStatusMessage('Please select a file first')
      return
    }
    
    setUploading(true)
    setProgress(0)
    setStatusMessage('Preparing upload...')
    
    try {
      // Determine the appropriate folder based on file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const folder = fileTypeMap[fileExtension] || 'other'
      
      // Create a unique filename with timestamp
      const timestamp = new Date().getTime()
      const uniqueFileName = `${timestamp}-${file.name}`
      const filePath = `${folder}/${uniqueFileName}`
      
      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)
      
      setStatusMessage('Uploading file...')
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('sites')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      // Note: onUploadProgress is not supported in the current type definitions
      // We're using the progress interval simulation instead
      
      clearInterval(progressInterval)
      
      if (error) {
        throw error
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('sites')
        .getPublicUrl(filePath)
      
      const result = {
        path: filePath,
        folder: folder,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrlData.publicUrl,
        uploadedAt: new Date().toISOString()
      }
      
      setProgress(100)
      setStatusMessage('Upload complete!')
      setUploadResult(result)
      
      // Call the success callback
      onUploadSuccess(result)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFile(null)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      setStatusMessage(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          <label 
            htmlFor="file-input" 
            className="inline-block px-5 py-3 bg-gradient-to-r from-blue-500/60 to-indigo-600/40 text-white rounded-lg cursor-pointer border border-white/20 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg"
          >
            Choose a file
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              required
            />
          </label>
          <span className="ml-4 text-slate-300">
            {file ? file.name : 'No file chosen'}
          </span>
        </div>
        
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white font-medium rounded-lg shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      
      {(uploading || statusMessage) && (
        <div className="mt-6">
          {uploading && (
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <p className="text-center text-slate-300 font-medium">{statusMessage}</p>
        </div>
      )}
      
      {uploadResult && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <h2 className="text-blue-400 font-semibold mb-2">Upload Result</h2>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all font-mono">
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
