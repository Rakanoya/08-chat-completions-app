// Get references to the DOM elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');

// Store conversation history
let conversationHistory = [
  {role: 'system', content: `You are a friendly Budget Travel Planner, specializing in cost-conscious travel advice. You help users find cheap flights, budget-friendly accommodations, affordable itineraries, and low-cost activities in their chosen destination.

  If a user's query is unrelated to budget travel, respond by stating that you do not know.`}
];

// Function to send user query to OpenAI and display response
async function sendMessage(userMessage) {
  // Add user message to conversation history
  conversationHistory.push({role: 'user', content: userMessage});
  
  // Show loading message while waiting for response
  responseContainer.textContent = 'Getting travel advice...';
  
  // Send a POST request to the OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', // We are POST-ing data to the API
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
      'Authorization': `Bearer ${apiKey}` // Include the API key for authorization
    },
    // Send model details and complete conversation history
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: conversationHistory, // Include all previous messages
      max_completion_tokens: 800, // Limit the response length to 200 tokens
      temperature: 0.7, // Set the creativity level of the response
      frequency_penalty: 0.5 // Reduce repetition in the response
    })
  });
  
  // Check if the response is successful
  if (!response.ok) {
    // Log the error to console for debugging
    console.error('API request failed:', response.status, response.statusText);
    // Show user-friendly error message
    responseContainer.textContent = 'Sorry, I\'m having trouble connecting to the travel advice service. Please try again in a moment.';
    // Remove the user message from history since the request failed
    conversationHistory.pop();
    return;
  }
  
  // Parse and store the response data
  const result = await response.json();
  
  // Check if the response has the expected structure
  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    // Log the error to console for debugging
    console.error('Unexpected API response structure:', result);
    // Show user-friendly error message
    responseContainer.textContent = 'Sorry, I received an unexpected response. Please try asking your question again.';
    // Remove the user message from history since the request failed
    conversationHistory.pop();
    return;
  }
  
  // Get the AI's response content
  const aiResponse = result.choices[0].message.content;
  
  // Add AI response to conversation history
  conversationHistory.push({role: 'assistant', content: aiResponse});
  
  // Display the AI's response on the page with preserved formatting
  responseContainer.textContent = aiResponse;
}

// Handle form submission
chatForm.addEventListener('submit', async (event) => {
  // Prevent the form from refreshing the page
  event.preventDefault();
  
  // Get the user's input from the form
  const userMessage = userInput.value.trim();
  
  // Check if user entered a message
  if (userMessage === '') {
    return; // Don't send empty messages
  }
  
  // Send the message to OpenAI
  await sendMessage(userMessage);
  
  // Clear the input field after sending
  userInput.value = '';
});