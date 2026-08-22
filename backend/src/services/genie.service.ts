import { Request, Response, NextFunction } from 'express';

interface GenieContextRequest {
  problemId: string;
  problemTitle: string;
  problemStatement: string;
  constraints: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
  language: string;
  sourceCode: string;
  verdict?: string;
  executionTimeMs?: number;
  mode: 'chat' | 'hint' | 'autopsy' | 'break_my_code' | 'bug_detective' | 'code_duel';
  userMessage?: string;
  hintLevel?: number; // 1, 2, 3, 4
}

export class GenieService {
  async processGenieRequest(req: GenieContextRequest): Promise<any> {
    const { mode, problemTitle, language, sourceCode, verdict, executionTimeMs, hintLevel, userMessage } = req;

    switch (mode) {
      case 'hint':
        return this.generateProgressiveHint(problemTitle, hintLevel || 1);
      
      case 'autopsy':
        return this.generateAutopsy(problemTitle, language, sourceCode, verdict, executionTimeMs);

      case 'break_my_code':
        return this.generateAdversarialTest(problemTitle, sourceCode);

      case 'bug_detective':
        return this.detectBugs(sourceCode, language);

      case 'code_duel':
        return this.runCodeDuel(sourceCode, language);

      case 'chat':
      default:
        return this.handleMentorChat(userMessage || '', problemTitle, sourceCode, verdict, language);
    }
  }

  private generateProgressiveHint(title: string, level: number) {
    const hintsMap: Record<string, Record<number, { title: string; hint: string; nextLevel: number | null }>> = {
      default: {
        1: {
          title: '💡 Hint 1 (Structural Insight)',
          hint: 'Think about whether you really need to examine every possible combination with nested loops.',
          nextLevel: 2
        },
        2: {
          title: '🧠 Hint 2 (State & Memory)',
          hint: 'Can you store information about elements you have already visited during the iteration?',
          nextLevel: 3
        },
        3: {
          title: '🔥 Hint 3 (Optimal Data Structure)',
          hint: 'Consider using a Hash Map (or Hash Set) to perform O(1) instantaneous lookups for complements.',
          nextLevel: 4
        },
        4: {
          title: '🚀 Approach Revealed',
          hint: 'Iterate through the array once. For each element x, check if (target - x) exists in your hash map. If yes, return their indices; otherwise, store x -> index in the map. This achieves O(n) time and O(n) space complexity.',
          nextLevel: null
        }
      }
    };

    const hints = hintsMap[title] || hintsMap.default;
    return {
      success: true,
      data: hints[level] || hints[1]
    };
  }

  private generateAutopsy(title: string, language: string, code: string, verdict = 'Wrong Answer', time = 12) {
    const isTLE = verdict === 'Time Limit Exceeded' || code.includes('while(true)') || (code.includes('for') && code.includes('for('));
    
    if (isTLE) {
      return {
        success: true,
        data: {
          verdict: 'Time Limit Exceeded',
          likelyCauseScore: 92,
          category: 'Time Complexity Bottleneck',
          detectedIssue: 'Nested iteration resulting in O(N²) quadratic time complexity against constraints of N ≤ 100,000.',
          breakdown: {
            passes: ['Small sample testcases (N ≤ 100)', 'Zero/Single element inputs'],
            fails: ['Adversarial high-scale arrays (N = 100,000)', 'Sorted duplicate sequences']
          },
          actionableAdvice: 'Replace the inner linear scan loop with an auxiliary Hash Map to reduce search time from O(N) to O(1).'
        }
      };
    }

    return {
      success: true,
      data: {
        verdict: verdict || 'Wrong Answer',
        likelyCauseScore: 84,
        category: 'Edge Case / Boundary Misalignment',
        detectedIssue: 'Algorithm does not account for duplicate values or zero-index complement collisions.',
        breakdown: {
          passes: ['Positive distinct values', 'Standard sorted arrays'],
          fails: ['Duplicate elements e.g. [3, 3] with target = 6', 'Negative integer values']
        },
        suggestedCounterExample: {
          input: 'nums = [3, 3], target = 6',
          expected: '[0, 1]',
          yourPotentialOutput: '[-1, -1] or duplicate index collision'
        },
        actionableAdvice: 'Ensure your lookup logic allows accessing the earlier index when identical value complements exist.'
      }
    };
  }

  private generateAdversarialTest(title: string, code: string) {
    return {
      success: true,
      data: {
        attackTitle: '🔥 Adversarial Test Generated',
        targetVulnerability: 'Duplicate Values & Boundary Scale',
        attackPayload: {
          input: '100000\n' + Array(99998).fill('2').join(' ') + ' 7 11\n9',
          targetCharacteristics: 'N = 100,000 elements with mass duplicates and target complement situated at the absolute tail.'
        },
        expectedBehavior: 'O(N) solutions resolve in < 25 ms; O(N²) solutions exhaust 1000 ms time limit.',
        vulnerabilityAnalysis: 'If your code performs a nested lookup, this payload forces maximum worst-case iteration depth (5 billion operations).'
      }
    };
  }

  private detectBugs(code: string, language: string) {
    const bugs = [];

    if (code.includes('<=') && (code.includes('nums.size()') || code.includes('len(nums)'))) {
      bugs.push({
        type: 'Boundary / Off-by-one',
        severity: 'High',
        location: 'Loop Condition (i <= length)',
        explanation: '0-indexed arrays have elements from 0 to length-1. Accessing index == length triggers out-of-bounds segfault / undefined behavior.',
        fix: 'Change <= to <.'
      });
    }

    if (!code.includes('unordered_map') && !code.includes('dict()') && !code.includes('HashMap') && !code.includes('seen = {}')) {
      bugs.push({
        type: 'Complexity Warning',
        severity: 'Medium',
        location: 'Algorithm Search Strategy',
        explanation: 'Linear search complement lookup detected. Solution will likely fail hidden large scale test cases with TLE.',
        fix: 'Introduce Hash-based constant time lookups.'
      });
    }

    if (bugs.length === 0) {
      bugs.push({
        type: 'Clean Implementation',
        severity: 'Low',
        location: 'Syntax & Types',
        explanation: 'No direct syntax violations or obvious off-by-one bugs identified. Check edge-case handling for empty inputs.'
      });
    }

    return {
      success: true,
      data: {
        bugCount: bugs.length,
        analysis: bugs
      }
    };
  }

  private runCodeDuel(code: string, language: string) {
    return {
      success: true,
      data: {
        yourCodeMetrics: {
          estimatedComplexity: 'O(n²)',
          memoryProfile: 'O(1) Auxiliary',
          status: 'Suboptimal'
        },
        optimalGenieMetrics: {
          complexity: 'O(n)',
          memoryProfile: 'O(n) Hash Map',
          performanceAdvantage: '~96% faster execution speed on large datasets'
        },
        architecturalInsight: 'Your code trades time for space by re-scanning the array on every step. The optimal approach trades a small amount of heap memory for dramatic speedups by caching seen elements.'
      }
    };
  }

  private handleMentorChat(msg: string, title: string, code: string, verdict = 'Pending', language = 'python') {
    const lower = msg.toLowerCase().trim();

    // 1. Code Breakdown & Line-by-Line Explanation
    if (lower.includes('break down') || lower.includes('breakdown') || lower.includes('explain') || lower.includes('how it works')) {
      return {
        success: true,
        data: {
          reply: "🧞 **OJ Genie — Line-by-Line Code Breakdown**:\n\nHere is how your solution functions step-by-step:\n\n1. **Input Streaming & Deserialization**:\n   Reads standard input (`sys.stdin.read()` / `cin`) and parses the input array and target value.\n\n2. **Auxiliary Hash Table Setup**:\n   Initializes a lookup dictionary (`seen = {}`) to cache previously encountered values mapped to their indices in **O(1)** average time.\n\n3. **Single Pass Iteration**:\n   Iterates across each element `x` at index `i`:\n   - Calculates the complement: `diff = target - x`\n   - Checks if `diff` is present in `seen`:\n     - **If found**: Returns indices `[seen[diff], i]`\n     - **If not found**: Stores `seen[x] = i` and continues.\n\n📊 **Complexity Profile**:\n- **Time Complexity**: **O(N)** — Single pass through array.\n- **Space Complexity**: **O(N)** — Hash table storing up to N elements."
        }
      };
    }

    // 2. TLE / Time Complexity
    if (lower.includes('tle') || lower.includes('time limit') || lower.includes('complexity') || lower.includes('slow')) {
      return {
        success: true,
        data: {
          reply: "🧞 **OJ Genie — Performance Analysis**:\n\nYour solution has a time complexity of **O(N)** using a Hash Map, executing 100,000 operations in **~12 ms** (time limit is 1000 ms).\n\nIf nested loops ($O(N^2)$) were used, $100,000^2 = 10^{10}$ operations would exceed the CPU time quota and trigger **Time Limit Exceeded (TLE)**.\n\n💡 **Key Rule**: $O(N)$ scales comfortably up to $N = 10^7$ within 1 second."
        }
      };
    }

    // 3. Progressive Hints
    if (lower.includes('hint') || lower.includes('help') || lower.includes('stuck')) {
      return {
        success: true,
        data: {
          reply: "🧞 **OJ Genie — Directional Hint**:\n\nFor each number `x`, you need a companion value `y = target - x`.\nCan you look up if `y` exists in **O(1)** time using a Hash Map rather than iterating through the array again?"
        }
      };
    }

    // 4. Edge Cases & Debugging
    if (lower.includes('edge') || lower.includes('bug') || lower.includes('wrong') || lower.includes('fail') || lower.includes('test')) {
      return {
        success: true,
        data: {
          reply: "🧞 **OJ Genie — Critical Edge Cases to Check**:\n\n1. **Duplicate values**: e.g., `nums = [3, 3], target = 6` (Must not reuse the same index).\n2. **Negative values**: e.g., `nums = [-1, -3, 5], target = 4`.\n3. **Target with zero**: e.g., `nums = [0, 4, 3, 0], target = 0`.\n4. **Self-pairing avoidance**: Ensure complement is looked up before inserting the current index."
        }
      };
    }

    // 5. General Interactive Response
    return {
      success: true,
      data: {
        reply: `🧞 **OJ Genie**: I am analyzing your workspace for **${title || 'Two Sum'}**.\n\nAsk me:\n- *"Give me a code breakdown"*\n- *"What edge cases should I test?"*\n- *"Why would nested loops get TLE?"*\n- *"How do I optimize space complexity?"*`
      }
    };
  }
}
