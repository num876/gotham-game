
(async () => {
  const state = {
    turn: 1,
    activeIdentity: 'batman',
    choices: [],
    consequences: [],
    harveyStability: 100,
    activeCase: { suspects: [], keyEvidence: [] }
  };
  const res = await fetch('http://localhost:3000/api/narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, playerChoice: 'Test', messageHistory: [] })
  });
  const text = await res.text();
  console.log('RAW STREAMED TEXT:');
  console.log(text);
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();
    JSON.parse(cleanText);
    console.log('SUCCESSFUL PARSE!');
  } catch(e) {
    console.error('PARSE ERROR:', e.message);
  }
})();
