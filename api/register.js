/**
 * Vercel Serverless API Proxy for Google Apps Script Web App
 * STRUCTURA'26 Symposium Registration System
 */

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx1mmdlSF-gvkQ06--A0st5Hvl2gNV30FsaOaTWqXAhS35NDWh2tdIY2W0AhuliqZgy/exec';

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are supported.'
    });
  }

  try {
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const gasResponse = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: payload,
      redirect: 'follow'
    });

    const responseText = await gasResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseErr) {
      responseData = {
        success: false,
        error: 'Invalid response received from Google Apps Script backend.',
        raw: responseText
      };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Vercel API Proxy Error:', error);
    return res.status(502).json({
      success: false,
      error: 'Failed to communicate with Google Apps Script backend: ' + (error.message || error)
    });
  }
};
