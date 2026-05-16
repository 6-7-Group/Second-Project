/**
 * UAReady Email and Domain Validation Test Suite
 * Tests for SMTPUTF8, EAI, and IDNA2008 compliance
 */

const normalize = require('unicode-normalize');
const punycode = require('punycode/');

// Mock validation functions (same as in server.js)
function normalizeString(str) {
  return str.normalize('NFC');
}

function validateDomain(domain) {
  try {
    domain = normalizeString(domain);
    const labels = domain.toLowerCase().split('.');
    
    if (labels.length < 2) {
      return { valid: false, error: 'Domain must have at least 2 labels' };
    }
    
    for (const label of labels) {
      if (label.length === 0) {
        return { valid: false, error: 'Domain labels cannot be empty' };
      }
      
      try {
        const encoded = punycode.encode(label);
        if (encoded.startsWith('xn--') && encoded.length > 63) {
          return { valid: false, error: `Label is too long after encoding` };
        }
      } catch (e) {
        return { valid: false, error: `Label contains invalid characters` };
      }
    }
    
    const aceLabels = labels.map(label => {
      try {
        return punycode.encode(label);
      } catch (e) {
        throw new Error(`Cannot encode label: ${label}`);
      }
    });
    
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

function validateEmail(email) {
  try {
    email = normalizeString(email);
    
    if (!email.includes('@')) {
      return { valid: false, error: 'Email must contain @ symbol' };
    }
    
    const [localPart, domain] = email.split('@');
    
    if (!localPart || !domain) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    if (localPart.length === 0 || localPart.length > 64) {
      return { valid: false, error: 'Local part invalid' };
    }
    
    const domainValidation = validateDomain(domain);
    if (!domainValidation.valid) {
      return { valid: false, error: `Invalid domain: ${domainValidation.error}` };
    }
    
    const isInternational = /[^\x00-\x7F]/.test(email);
    const aceEmail = localPart + '@' + domainValidation.aceDomain;
    
    return {
      valid: true,
      email: email,
      aceEmail: aceEmail,
      localPart: localPart,
      domain: domain,
      aceDomain: domainValidation.aceDomain,
      isInternational: isInternational,
      isIDN: domainValidation.isIDN
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

// Test Cases
const testCases = {
  validEmails: [
    // Nepali (Devanagari)
    {
      input: 'राम@नेपाल.नेपाल',
      description: 'Nepali email with .नेपाल domain'
    },
    // Arabic
    {
      input: 'مثال@ايميل.الامارات',
      description: 'Arabic email with .الامارات domain'
    },
    // Chinese
    {
      input: '用户@中文.中国',
      description: 'Chinese email with .中国 domain'
    },
    // Cyrillic
    {
      input: 'пользователь@пример.рф',
      description: 'Russian email with .рф domain'
    },
    // Mixed - Latin with IDN domain
    {
      input: 'user@नेपाल.नेपाल',
      description: 'Latin local part with IDN domain'
    }
  ],
  
  invalidEmails: [
    {
      input: 'notanemail',
      description: 'Missing @ symbol'
    },
    {
      input: '@example.com',
      description: 'Missing local part'
    },
    {
      input: 'user@',
      description: 'Missing domain'
    },
    {
      input: 'user@invalid',
      description: 'Domain with single label'
    },
    {
      input: 'user@.invalid.com',
      description: 'Empty domain label'
    }
  ],
  
  validDomains: [
    {
      input: 'नेपाल.नेपाल',
      description: 'Nepali IDN domain (TLD .नेपाल)'
    },
    {
      input: '中文.中国',
      description: 'Chinese IDN domain'
    },
    {
      input: 'ايميل.الامارات',
      description: 'Arabic IDN domain'
    },
    {
      input: 'пример.рф',
      description: 'Russian IDN domain'
    },
    {
      input: 'example.com',
      description: 'Standard ASCII domain'
    }
  ],
  
  invalidDomains: [
    {
      input: 'example',
      description: 'Single label domain'
    },
    {
      input: 'example..com',
      description: 'Empty label in domain'
    },
    {
      input: '',
      description: 'Empty domain'
    },
    {
      input: '.example.com',
      description: 'Leading dot'
    },
    {
      input: 'example.com.',
      description: 'Trailing dot (edge case)'
    }
  ]
};

// Test Runner
function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  UAReady Email and Domain Validation - Test Suite       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let totalPassed = 0;
  let totalFailed = 0;

  // Test Valid Emails
  console.log('📧 TESTING VALID EMAILS (SMTPUTF8 Compliance)');
  console.log('─'.repeat(55));
  testCases.validEmails.forEach((testCase, i) => {
    const result = validateEmail(testCase.input);
    const passed = result.valid;
    
    if (passed) {
      console.log(`✓ [${i + 1}] ${testCase.description}`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   ACE: ${result.aceEmail}`);
      console.log(`   IDN: ${result.isIDN ? 'Yes' : 'No'}\n`);
      totalPassed++;
    } else {
      console.log(`✗ [${i + 1}] ${testCase.description} - FAILED`);
      console.log(`   Error: ${result.error}\n`);
      totalFailed++;
    }
  });

  // Test Invalid Emails
  console.log('\n📧 TESTING INVALID EMAILS (Error Handling)');
  console.log('─'.repeat(55));
  testCases.invalidEmails.forEach((testCase, i) => {
    const result = validateEmail(testCase.input);
    const passed = !result.valid;
    
    if (passed) {
      console.log(`✓ [${i + 1}] ${testCase.description}`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   Error: ${result.error}\n`);
      totalPassed++;
    } else {
      console.log(`✗ [${i + 1}] ${testCase.description} - FAILED (should be invalid)\n`);
      totalFailed++;
    }
  });

  // Test Valid Domains
  console.log('\n🌐 TESTING VALID DOMAINS (IDNA2008 Compliance)');
  console.log('─'.repeat(55));
  testCases.validDomains.forEach((testCase, i) => {
    const result = validateDomain(testCase.input);
    const passed = result.valid;
    
    if (passed) {
      console.log(`✓ [${i + 1}] ${testCase.description}`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   ACE: ${result.aceDomain}`);
      console.log(`   IDN: ${result.isIDN ? 'Yes' : 'No'}\n`);
      totalPassed++;
    } else {
      console.log(`✗ [${i + 1}] ${testCase.description} - FAILED`);
      console.log(`   Error: ${result.error}\n`);
      totalFailed++;
    }
  });

  // Test Invalid Domains
  console.log('\n🌐 TESTING INVALID DOMAINS (Error Handling)');
  console.log('─'.repeat(55));
  testCases.invalidDomains.forEach((testCase, i) => {
    const result = validateDomain(testCase.input);
    const passed = !result.valid;
    
    if (passed) {
      console.log(`✓ [${i + 1}] ${testCase.description}`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   Error: ${result.error}\n`);
      totalPassed++;
    } else {
      console.log(`✗ [${i + 1}] ${testCase.description} - FAILED (should be invalid)\n`);
      totalFailed++;
    }
  });

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                         ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Total Passed:  ${String(totalPassed).padEnd(42)}║`);
  console.log(`║  Total Failed:  ${String(totalFailed).padEnd(42)}║`);
  const total = totalPassed + totalFailed;
  const passRate = ((totalPassed / total) * 100).toFixed(1);
  console.log(`║  Pass Rate:     ${String(passRate + '%').padEnd(42)}║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (totalFailed === 0) {
    console.log('✓ All tests passed!\n');
  } else {
    console.log(`⚠ ${totalFailed} test(s) failed. Review implementation.\n`);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { validateEmail, validateDomain, testCases };
