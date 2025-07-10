import fetch from 'node-fetch';
const https = require('https');
import config from '../config/config';

/**
 * @param prompt makes a request to AI service with the provided prompt
 * @returns returns the AI response
 */
export async function getAiResponse(prompt: string): Promise<any> {
  // Needed only for self-signed certs or local dev HTTPS, Don't use this in production
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  // this will go to our (private) Azure OpenAI service
  // for demo running locally I'm using a self-signed cert
  // and SSH tunnel via bastion host
  const url = 'https://localhost:8083/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-01-01-preview';
  const body = JSON.stringify({
    messages: [{ role: 'system', content: prompt }],
    max_tokens: 50
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Host': 'css-ai-dev-openai-east.openai.azure.com',
      'api-key': config.aiKey,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body).toString()
    },
    body: body,
    agent: agent // Use the custom agent to allow self-signed certs
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response}`);

  return response.json();

};

