# Security Architecture & Sandbox Hardening Specification

> **Author**: Kuswanth Tumma  
> **Platform**: Online Judge Platform  
> **Target**: Hardened Linux Execution Sandboxes  

---

## 1. Threat Model & Sandbox Defenses

The Online Judge execution layer operates in a multi-tenant untrusted environment where arbitrary code submitted by users is executed.

```
                    SECURITY
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
   Container        Backend          Input
   Security         Security        Security
       │               │               │
   T1 T2 T3          T6              T7 T8
   T4 T5
```

---

## 2. Container Sandbox Constraints

| Constraint | Flag / Parameter | Security Impact |
| :--- | :--- | :--- |
| **Network Severing** | `--network none` | Prevents data exfiltration and reverse shells |
| **Memory Cgroups** | `--memory 256m --memory-swap 256m` | Blocks host memory starvation |
| **Process Cap** | `--pids-limit 64` | Neutralizes fork bomb attacks |
| **Read-Only Rootfs** | `--read-only` | Prevents disk persistence and container modification |
| **Unprivileged User** | `UID 10001:10001` | Drops Linux root capabilities |
| **Syscall Whitelist** | `--security-opt seccomp=seccomp.json` | Blocks dangerous kernel system calls |

---

## 3. T1–T8 Security Verification Matrix

1. **T1: Infinite Loop** $\rightarrow$ Terminated at execution quota with `Time Limit Exceeded`.
2. **T2: Memory Explosion** $\rightarrow$ Killed by cgroups v2 OOM with `Memory Limit Exceeded`.
3. **T3: Network Socket** $\rightarrow$ Blocked with `Runtime Error (Network Unreachable)`.
4. **T4: Filesystem Write** $\rightarrow$ Blocked with `[Errno 30] Read-only file system`.
5. **T5: Fork Bomb** $\rightarrow$ Restrained by `--pids-limit 64`.
6. **T6: Privilege Escalation** $\rightarrow$ Server-side JWT authorization check returns `403 Forbidden`.
7. **T7: Injection Attacks** $\rightarrow$ Zod validation schema rejects malicious queries with `400 Bad Request`.
8. **T8: Payload Size >64KB** $\rightarrow$ Buffer limit rejects oversized source payloads.
