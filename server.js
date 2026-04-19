const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();
app.use(express.urlencoded({ extended: false }));
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const OWNER_PHONE = '+18168057455';
app.post('/incoming-call', function(req, res) {
  res.type('text/xml');
  res.send('<Response><Gather input="speech" action="/classify" timeout="8" speechTimeout="2"><Say>Hi, thanks for calling. Please tell me the reason for your call.</Say></Gather></Response>');
});
app.post('/classify', async function(req, res) {
  const speech = req.body.SpeechResult || '';
  res.type('text/xml');
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Classify into one word: CUSTOMER, VENDOR, SUPPORT, JOB, or SPAM. Caller said: ' + speech + '. Reply with only one word.' }]
    });
    const intent = msg.content[0].text.trim().toUpperCase();
    if (intent === 'CUSTOMER') {
      res.send('<Response><Say>Let me connect you now.</Say><Dial>' + OWNER_PHONE + '</Dial></Response>');
    } else if (intent === 'VENDOR') {
      res.send('<Response><Say>Please email us your proposal. Goodbye.</Say><Hangup/></Response>');
    } else if (intent === 'SUPPORT') {
      res.send('<Response><Say>Our support team will follow up shortly.</Say><Hangup/></Response>');
    } else if (intent === 'JOB') {
      res.send('<Response><Say>Please email us your resume. Thank you.</Say><Hangup/></Response>');
    } else {
      res.send('<Response><Hangup/></Response>');
    }
  } catch(err) {
    console.error(err);
    res.send('<Response><Say>Something went wrong. Please try again.</Say><Hangup/></Response>');
  }
});
app.listen(3000, function() { console.log('Running on port 3000'); });