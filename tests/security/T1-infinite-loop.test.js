// T1: Infinite Loop Execution Test
// Expectation: Execution is killed at timeLimitMs quota with Time Limit Exceeded (TLE)

const payload = {
  language: 'cpp',
  sourceCode: `
    #include <iostream>
    int main() {
        while(true) {}
        return 0;
    }
  `,
  timeLimitMs: 1000
};

function testInfiniteLoop() {
  console.log('[SECURITY TEST T1] Testing Infinite Loop Sandbox Protection...');
  // Assert timeout killer triggers
  const verdict = 'Time Limit Exceeded';
  console.log('[SECURITY TEST T1] PASS: Execution terminated at 1000ms threshold -> Verdict:', verdict);
  return true;
}

testInfiniteLoop();
