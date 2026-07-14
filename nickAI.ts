export async function sendToNickAI(message: string) {
  try {
    const res = await fetch('https://nick-ai.onrender.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    const data = await res.json()
    return data.reply || data.message || "Samahani, sikuelewa"
  } catch (error) {
    return "NICK AI hayupo online sasa hivi"
  }
}
