'use client'

import { useState } from 'react'

interface UploadRecord {
  name: string
  size: number
  type: string
  folder: string
  path: string
  url: string
  uploadedAt: string
}

interface UploadHistoryProps {
  history: UploadRecord[]
  onClose: () => void
}

export default function UploadHistory({ history, onClose }: UploadHistoryProps) {
  const [filter, setFilter] = useState('')
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  // Filter history based on search term
  const filteredHistory = filter
    ? history.filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.folder.toLowerCase().includes(filter.toLowerCase()) ||
        item.type.toLowerCase().includes(filter.toLowerCase())
      )
    : history
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/50 w-full max-w-4xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
          <h2 className="text-xl font-semibold text-slate-100">Upload History</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-light"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-700/50">
          <input
            type="text"
            placeholder="Search by name, folder, or file type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {history.length === 0 
                ? 'No uploads yet' 
                : 'No results match your search'}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 sticky top-0">
                <tr>
                  <th className="p-3 text-slate-300 font-semibold">File Name</th>
                  <th className="p-3 text-slate-300 font-semibold">Folder</th>
                  <th className="p-3 text-slate-300 font-semibold">Size</th>
                  <th className="p-3 text-slate-300 font-semibold">Uploaded</th>
                  <th className="p-3 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-slate-700/30 hover:bg-slate-700/20"
                  >
                    <td className="p-3 text-slate-300">{item.name}</td>
                    <td className="p-3 text-slate-300 capitalize">{item.folder}</td>
                    <td className="p-3 text-slate-300">{formatFileSize(item.size)}</td>
                    <td className="p-3 text-slate-300">{formatDate(item.uploadedAt)}</td>
                    <td className="p-3">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
