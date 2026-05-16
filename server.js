const express = require('express');
const cors = require('cors');
const path = require('path');
const punycode = require('punycode/');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * Unicode Normalization (NFC)
 */
function normalizeString(str) {
  return str.normalize('NFC');
}

/**
 * Validate Domain Name with IDNA support
 */
function validateDomain(domain) {
  try {
    // Normalize the domain
    domain = normalizeString(domain);
    
    // Split domain into labels
    const labels = domain.toLowerCase().split('.');
    
    if (labels.length < 2) {
      return { valid: false, error: 'Domain must have at least 2 labels (e.g., example.com)' };
    }
    
    // Check each label
    for (const label of labels) {
      if (label.length === 0) {
        return { valid: false, error: 'Domain labels cannot be empty' };
      }
      
      // Try to encode as punycode (IDNA2008)
      try {
        const encoded = punycode.toASCII(label);
        if (encoded.length > 63) {
          return { valid: false, error: `Label "${label}" is too long after encoding` };
        }
      } catch (e) {
        return { valid: false, error: `Label "${label}" contains invalid characters` };
      }
    }
    
    // Reconstruct as ACE format (Punycode-encoded)
    const aceLabels = labels.map(label => punycode.toASCII(label));
    
    const aceDomain = aceLabels.join('.');
    
    return {
      valid: true,
      domain: domain,
      aceDomain: aceDomain,
      labels: labels,
      isIDN: labels.some(label => /[^\x00-\x7F]/.test(label))
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * Validate Email Address with SMTPUTF8 support
 */
function validateEmail(email) {
  try {
    // Normalize
    email = normalizeString(email);
    
    // Basic structure check
    if (!email.includes('@')) {
      return { valid: false, error: 'Email must contain @ symbol' };
    }
    
    const [localPart, domain] = email.split('@');
    
    if (!localPart || !domain) {
      return { valid: false, error: 'Invalid email format: missing local or domain part' };
    }
    
    if (localPart.length === 0) {
      return { valid: false, error: 'Local part cannot be empty' };
    }
    
    if (localPart.length > 64) {
      return { valid: false, error: 'Local part is too long (max 64 characters)' };
    }
    
    // Validate domain part
    const domainValidation = validateDomain(domain);
    if (!domainValidation.valid) {
      return { valid: false, error: `Invalid domain: ${domainValidation.error}` };
    }
    
    // Check if uses international characters (SMTPUTF8)
    const isInternational = /[^\x00-\x7F]/.test(email);
    
    // Construct ACE email (punycode-encoded domain)
    const aceEmail = localPart + '@' + domainValidation.aceDomain;
    
    return {
      valid: true,
      email: email,
      aceEmail: aceEmail,
      localPart: localPart,
      domain: domain,
      aceDomain: domainValidation.aceDomain,
      isInternational: isInternational,
      isIDN: domainValidation.isIDN,
      standards: {
        smtputf8: isInternational,
        eai: isInternational,
        idna2008: domainValidation.isIDN
      }
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * API Endpoints
 */

// Validate single email
app.post('/api/validate-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const result = validateEmail(email);
  res.json(result);
});

// Validate single domain
app.post('/api/validate-domain', (req, res) => {
  const { domain } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }
  
  const result = validateDomain(domain);
  res.json(result);
});

// Batch validation
app.post('/api/validate-batch', (req, res) => {
  const { emails, domains } = req.body;
  const results = { emails: [], domains: [] };
  
  if (emails && Array.isArray(emails)) {
    results.emails = emails.map(email => validateEmail(email));
  }
  
  if (domains && Array.isArray(domains)) {
    results.domains = domains.map(domain => validateDomain(domain));
  }
  
  res.json(results);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UAReady Email and Domain Validator is running' });
});

app.listen(PORT, () => {
  console.log(`✓ UAReady Email Validator running on http://localhost:${PORT}`);
  console.log(`✓ Open http://localhost:${PORT} in your browser`);
});
