'use client'
import React, { useState } from 'react'

const DebugDeletedProjects = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects/deleted?page=1&limit=8')
      const text = await response.text()
      setResult(`Status: ${response.status}\nResponse: ${text}`)
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLegacyAPI = async () => {
    setLoading(true)
    try {
      // Let's also test calling the action directly
      const { getDeletedProjects } = await import('@/actions/project')
      const result = await getDeletedProjects()
      setResult(`Legacy API result: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3>Debug Deleted Projects</h3>
      <div className="space-x-2 mb-4">
        <button onClick={testAPI} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
          Test New API
        </button>
        <button onClick={testLegacyAPI} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded">
          Test Legacy API
        </button>
      </div>
      {loading && <p>Loading...</p>}
      <pre className="bg-gray-100 p-2 rounded text-xs">{result}</pre>
    </div>
  )
}

export default DebugDeletedProjects
