import React from 'react'
import { Loader2 } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Loader2 size={48} className="text-primary-600 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-secondary-800 mb-2">
          Loading...
        </h2>
        <p className="text-secondary-600">
          Please wait while we prepare your experience
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen 