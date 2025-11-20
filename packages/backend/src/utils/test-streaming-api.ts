import 'dotenv/config'

async function testStreamingAPI() {
  console.log('🧪 Testing Streaming API with Supabase Tools...\n')
  
  const apiUrl = 'http://localhost:3001/api/chat'
  
  const testMessage = {
    messages: [
      {
        role: 'user',
        content: 'What is the price of the Acme Cup?'
      }
    ]
  }
  
  console.log('📝 Sending request:', JSON.stringify(testMessage, null, 2))
  console.log('-'.repeat(60))
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    
    if (reader) {
      console.log('\n🔄 Streaming response:')
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr.trim()) {
              try {
                const data = JSON.parse(dataStr)
                if (data.type === 'delta') {
                  process.stdout.write(data.content)
                  fullResponse += data.content
                } else if (data.type === 'done') {
                  console.log('\n\n✅ Stream completed')
                  console.log('Full response:', data.content)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    }
    
    console.log('\n' + '-'.repeat(60))
    console.log('✨ Test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    console.error('\nMake sure the backend server is running on port 3001')
    console.error('Run: npm run dev')
  }
}

testStreamingAPI()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
