# 🧞 OJ Genie — AI Coding Mentor Design Specification

> **Author**: Kuswanth Tumma  
> **Platform**: Online Judge Platform  
> **Module**: AI Reasoning & Scaffolding Engine  

---

## 1. System Philosophy

Instead of delivering raw 1-click code generation that undermines pedagogical integrity, **OJ Genie** provides **progressive learning ladders**, root-cause autopsies, and adversarial testing.

```
                 ONLINE JUDGE PLATFORM
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       CODE EXECUTION            OJ GENIE
             │                       │
       Docker Sandbox          AI Mentor
             │                       │
       ┌─────┼─────┐           ┌─────┼──────┐
       ▼     ▼     ▼           ▼     ▼      ▼
      C++   Java Python      Hint Debug Autopsy
                                │
                                ▼
                         Adversarial Tests
```

---

## 2. Core Genie Capabilities

### 🔍 1. Line-by-Line Code Breakdown
Dissects solutions into input streaming, lookup indexing, single-pass traversal, and time/space complexity analysis.

### 💡 2. 4-Tier Adaptive Hints
1. **Tier 1 (Structural Insight)**: Problem paradigm guidance.
2. **Tier 2 (State & Memory)**: In-flight state caching recommendation.
3. **Tier 3 (Data Structure)**: Hash Map / Hash Set selection.
4. **Tier 4 (Approach Revealed)**: Full algorithmic blueprint without dumping raw code.

### 🧪 3. Submission Autopsy & Root-Cause Diagnosis
Diagnoses failed submissions (TLE vs. Wrong Answer), calculates an AI confidence score, and provides concrete counter-examples.

### 🐛 4. Bug Detective
Automated scanning for off-by-one errors (`i <= n`), uninitialized lookup dictionaries, and asymptotic bottlenecks.

### 🔥 5. Break My Code (Adversarial Tester)
Generates scale-breaking counter-examples ($N = 100,000$, duplicates) specifically tailored to stress-test candidate solutions.
