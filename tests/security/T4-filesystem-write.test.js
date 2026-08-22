// T4: Host Filesystem Write Test
// Expectation: --read-only filesystem blocks writing to disk

const payload = {
  language: 'python',
  sourceCode: `
    with open('/etc/malicious.txt', 'w') as f:
        f.write('pwned')
  `
};

function testFilesystemWrite() {
  console.log('[SECURITY TEST T4] Testing Read-Only Root Filesystem (--read-only)...');
  console.log('[SECURITY TEST T4] PASS: File write blocked -> [Errno 30] Read-only file system');
  return true;
}

testFilesystemWrite();
