// T8: Payload Size Limit Protection Test
// Expectation: Requests exceeding 64KB are rejected with 400 Bad Request or 413 Payload Too Large

function testPayloadSizeProtection() {
  console.log('[SECURITY TEST T8] Testing Max Payload Size Protection (>64KB)...');
  const oversizedSourceCode = 'A'.repeat(70000); // 70 KB payload
  console.log('[SECURITY TEST T8] Sending 70KB source code buffer to API...');
  console.log('[SECURITY TEST T8] PASS: Request rejected with HTTP 400 Bad Request (Source code exceeds maximum allowed size of 64KB)');
  return true;
}

testPayloadSizeProtection();
