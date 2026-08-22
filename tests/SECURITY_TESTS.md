# Security Test Suite & Sandbox Isolation Verification
## Online Judge Platform — Security & Edge Case Test Matrix

---

| Metadata | Details |
| :--- | :--- |
| **Project Title** | Online Judge Platform |
| **Test Engine** | Docker Kernel Isolation (cgroups v2 + seccomp) |
| **Author** | **Kuswanth Tumma** |
| **Status** | Formal Verification Suite |
| **Date** | August 2026 |

---

## 🛡️ Security Test Cases & Execution Matrix

This document defines the 8 essential security and edge-case verification tests for the Online Judge Platform to guarantee host infrastructure protection and sandbox resilience.

---

### Test 1: Infinite Loop / CPU Starvation
- **Objective**: Verify that code containing an infinite loop does not hang the worker or monopolize CPU cores.
- **Payload (C++)**:
  ```cpp
  #include <iostream>
  using namespace std;
  int main() {
      while (true) {}
      return 0;
  }
  ```
- **Execution Mechanism**: Hard worker timer (`timeoutLimit = timeLimitMs + 1000`) + `--cpus 1.0` cgroup quota.
- **Expected Verdict**: `Time Limit Exceeded (TLE)`
- **Host Impact**: Container killed via `SIGKILL` cleanly; host CPU drops back to baseline.

---

### Test 2: Massive Memory Allocation / Out-Of-Memory (OOM)
- **Objective**: Verify that memory explosion attempts are terminated safely without crashing the host RAM.
- **Payload (C++)**:
  ```cpp
  #include <iostream>
  #include <vector>
  using namespace std;
  int main() {
      // Attempt to allocate 1 GB RAM (exceeds 256 MB cgroup cap)
      vector<int> bigArray(250000000, 1);
      cout << bigArray[0] << endl;
      return 0;
  }
  ```
- **Execution Mechanism**: `--memory 256m --memory-swap 256m` enforced by Linux memory cgroup.
- **Expected Verdict**: `Memory Limit Exceeded` or `Runtime Error` (OOM Killer exit).
- **Host Impact**: Container terminated immediately by Linux kernel OOM Killer; zero host RAM degradation.

---

### Test 3: Network Data Exfiltration & Socket Creation
- **Objective**: Verify that user code cannot open external sockets, make HTTP requests, or exfiltrate environment secrets.
- **Payload (Python)**:
  ```python
  import socket
  s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  s.connect(("8.8.8.8", 53))
  ```
- **Execution Mechanism**: `--network none` unlinks container network namespace from host.
- **Expected Verdict**: `Runtime Error` (Network is unreachable).
- **Host Impact**: Zero outgoing packets transmitted.

---

### Test 4: Host Filesystem Read/Write Access & Directory Escape
- **Objective**: Verify that user code cannot read `/etc/passwd`, write to `/bin`, or escape `/sandbox`.
- **Payload (C++)**:
  ```cpp
  #include <iostream>
  #include <fstream>
  using namespace std;
  int main() {
      ofstream file("/etc/hacked.txt");
      if (file.is_open()) {
          file << "compromised";
          file.close();
      }
      return 0;
  }
  ```
- **Execution Mechanism**: Read-only root filesystem (`--read-only`) + read-only volume mount (`/sandbox:ro`).
- **Expected Verdict**: `Runtime Error` or clean execution with write failure (Read-only file system error).
- **Host Impact**: File creation rejected by OS kernel.

---

### Test 5: Fork Bomb / Process Table Exhaustion
- **Objective**: Verify that recursive process spawns cannot exhaust the host OS PID table.
- **Payload (C++)**:
  ```cpp
  #include <unistd.h>
  int main() {
      while (1) {
          fork();
      }
      return 0;
  }
  ```
- **Execution Mechanism**: `--pids-limit 64` enforced via Linux `pids` cgroup + `seccomp.json` filter.
- **Expected Verdict**: `Runtime Error` or `Time Limit Exceeded`
- **Host Impact**: Fork calls fail immediately once 64 threads are reached; host OS unaffected.

---

### Test 6: Frontend Role Manipulation (Privilege Escalation)
- **Objective**: Verify that editing client browser state (`role: "Admin"`) does not grant administrator privileges on the backend.
- **Test Procedure**:
  1. Login as a regular user (`role: "User"`).
  2. Send `POST /api/problems` using the user's JWT.
- **Execution Mechanism**: `requireAdmin` middleware checks decoded JWT payload directly from server signature.
- **Expected Response**: `403 Forbidden` (`FORBIDDEN: Access denied. Administrator privileges required.`).

---

### Test 7: Script & NoSQL Injection in Text Fields
- **Objective**: Verify that problem statements, inputs, and search strings are sanitized.
- **Test Procedure**:
  - Send `GET /api/problems?search={"$gt": ""}`.
- **Execution Mechanism**: Zod schema validation + parameterized Mongoose queries.
- **Expected Response**: Handled safely as string regex without triggering NoSQL injection.

---

### Test 8: Code Size Limit Boundary Check (65 KB Payload)
- **Objective**: Verify that code larger than 64 KB is rejected prior to database storage or queueing.
- **Test Procedure**:
  - Submit a source code string of 65,537 bytes to `POST /api/submissions`.
- **Execution Mechanism**: Zod schema check (`max(65536)`) + SubmissionService byte buffer check.
- **Expected Response**: `400 Bad Request` (`VALIDATION_ERROR: Code size exceeds 64KB limit`).
