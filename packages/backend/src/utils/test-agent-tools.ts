import 'dotenv/config'
import { createCommerceAgent, convertToBaseMessage, extractMessageContent } from '../langgraph/agent.js'
import { HumanMessage } from '@langchain/core/messages'

async function testAgentTools() {
  console.log('🧪 Testing Commerce Agent with Supabase Tools...\n')

  try {
    // Create the agent
    const agent = createCommerceAgent()
    console.log('✅ Agent created successfully\n')

    // Test cases
    const testQueries = [
      'Can you search for products under $100?',
      'Show me products in the electronics category',
      'What products do you have in stock?',
      'Find products with "laptop" in the name',
      'Show me the details of product with ID 1'
    ]

    for (const query of testQueries) {
      console.log(`📝 Testing query: "${query}"`)
      console.log('-'.repeat(60))
      
      try {
        // Create the message
        const messages = [new HumanMessage(query)]
        
        // Invoke the agent
        const response = await agent.invoke({ messages })
        
        // Extract the response
        const lastMessage = response.messages[response.messages.length - 1]
        const { content } = extractMessageContent(lastMessage)
        
        console.log('🤖 Agent Response:')
        console.log(content)
        console.log('\n')
      } catch (error) {
        console.error(`❌ Error processing query: ${error}`)
      }
    }

    console.log('✅ All tests completed!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
    process.exit(1)
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAgentTools()
    .then(() => {
      console.log('\n✨ Agent tools test completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Agent tools test failed:', error)
      process.exit(1)
    })
}
