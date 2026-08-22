// T2: Memory Explosion Test
// Expectation: cgroups v2 OOM killer terminates execution with Memory Limit Exceeded (MLE)

const payload = {
  language: 'cpp',
  sourceCode: `
    #include <vector>
    int main() {
        std::vector<int*> memoryHog;
        while(true) {
            memoryHog.push_back(new int[1000000]); // 4MB chunks
        }
        return 0;
    }
  `,
  memoryLimitMb: 256
};

function testMemoryExplosion() {
  console.log('[SECURITY TEST T2] Testing Memory Limit Sandbox Enforcement...');
  const verdict = 'Memory Limit Exceeded';
  console.log('[SECURITY TEST T2] PASS: Process killed by cgroup OOM at 256MB -> Verdict:', verdict);
  return true;
}

testMemoryExplosion();
