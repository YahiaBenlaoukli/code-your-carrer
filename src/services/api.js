export const apiService = {
  // Extract text from uploaded CV
  async extractText(file) {
    console.log('📤 Sending file to server:', file.name)
    
    const formData = new FormData()
    formData.append('pdfFile', file)

    const response = await fetch('/extract-text', {
      method: 'POST',
      body: formData
    })

    console.log('📥 Server response status:', response.status)
    console.log('📥 Server response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Server error response:', errorText)
      throw new Error('Failed to extract text from file')
    }

    const result = await response.json()
    console.log('✅ Server response received successfully')
    
    return result
  },

  // Health check
  async healthCheck() {
    const response = await fetch('/health')
    if (!response.ok) {
      throw new Error('API health check failed')
    }
    return response.json()
  }
}

export default apiService 