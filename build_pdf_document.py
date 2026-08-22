import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Online Judge Platform — High-Level Design (HLD) Specification</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
            @bottom-right {
                content: "Page " counter(page);
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 9pt;
                color: #666;
            }
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
        }

        /* Cover Page */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            page-break-after: always;
            border-left: 8px solid #0052cc;
            padding-left: 40px;
            margin-top: 40px;
        }

        .cover-title {
            font-size: 32pt;
            font-weight: 700;
            color: #0052cc;
            margin: 0 0 10px 0;
            line-height: 1.2;
        }

        .cover-subtitle {
            font-size: 18pt;
            font-weight: 400;
            color: #4a5568;
            margin: 0 0 40px 0;
        }

        .cover-meta {
            margin-top: 60px;
            font-size: 11pt;
            color: #4a5568;
        }

        .cover-meta table {
            border-collapse: collapse;
        }

        .cover-meta td {
            padding: 6px 16px 6px 0;
            font-size: 11pt;
            border: none;
        }

        .cover-meta td.label {
            font-weight: 600;
            color: #2d3748;
        }

        /* Headings */
        h1 {
            font-size: 20pt;
            color: #0052cc;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 35px;
            margin-bottom: 15px;
            page-break-after: avoid;
        }

        h2 {
            font-size: 15pt;
            color: #2d3748;
            border-bottom: 1px solid #edf2f7;
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 12px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 12.5pt;
            color: #2b6cb0;
            margin-top: 20px;
            margin-bottom: 10px;
            page-break-after: avoid;
        }

        /* Callout Boxes */
        .alert {
            background-color: #f7fafc;
            border-left: 4px solid #3182ce;
            padding: 14px 18px;
            margin: 18px 0;
            border-radius: 0 4px 4px 0;
            font-size: 10pt;
        }

        .alert-title {
            font-weight: 700;
            color: #2b6cb0;
            margin-bottom: 4px;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
            font-size: 10pt;
            page-break-inside: avoid;
        }

        th, td {
            border: 1px solid #cbd5e0;
            padding: 8px 12px;
            text-align: left;
        }

        th {
            background-color: #ebf8ff;
            color: #2b6cb0;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: #f7fafc;
        }

        /* Code Blocks */
        pre, code {
            font-family: 'Consolas', 'Courier New', Courier, monospace;
        }

        pre {
            background-color: #1a202c;
            color: #f7fafc;
            padding: 14px 18px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 9.5pt;
            line-height: 1.45;
            margin: 16px 0;
            page-break-inside: avoid;
        }

        code {
            background-color: #edf2f7;
            color: #c53030;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5pt;
        }

        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }

        /* Diagrams ASCII / Blocks */
        .diagram-box {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 15px;
            margin: 18px 0;
            font-family: 'Consolas', monospace;
            font-size: 9pt;
            white-space: pre;
            overflow-x: auto;
            color: #0f172a;
            page-break-inside: avoid;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <div class="cover-title">Online Judge Platform</div>
        <div class="cover-subtitle">High-Level Design (HLD) Architecture Blueprint</div>
        <hr style="border: 0; border-top: 3px solid #0052cc; width: 120px; margin: 20px 0 40px 0;">
        <div class="cover-meta">
            <table>
                <tr><td class="label">Document Type:</td><td>High-Level Design (HLD) Blueprint Specification</td></tr>
                <tr><td class="label">Document Version:</td><td>1.0.0-RELEASE</td></tr>
                <tr><td class="label">Architecture Variant:</td><td>MERN & Django Micro-Services Ready Blueprint</td></tr>
                <tr><td class="label">Author:</td><td>System Design & Architecture Lead</td></tr>
                <tr><td class="label">Target Audience:</td><td>Engineering Leadership, Review Mentors, Systems Team</td></tr>
                <tr><td class="label">Date:</td><td>July 2026</td></tr>
            </table>
        </div>
    </div>

    <!-- 1. PROJECT OVERVIEW -->
    <h1>1. Executive Summary & Project Overview</h1>
    <p>The <strong>Online Judge Platform</strong> is a scalable web application where software engineers and algorithmic problem solvers can solve programming challenges, submit source code in multiple languages (C++, Python 3, Java), and receive real-time automated verdicts evaluated securely against concealed test cases.</p>
    <p>Executing untrusted user-submitted code presents severe infrastructure security risks: remote code execution (RCE), host memory exhaustion, CPU hogging, fork bombs, and unauthorized file access. Simultaneously, submission traffic can be bursty, requiring a non-blocking architecture during activity spikes.</p>

    <div class="diagram-box">
                    +-------------------------------------+
                    |       React 18 SPA Client           |
                    +------------------+------------------+
                                       |
                                       | HTTPS (REST API / JWT)
                                       v
                    +-------------------------------------+
                    |      Nginx Reverse Proxy & LB       |
                    +------------------+------------------+
                                       |
                                       v
                    +-------------------------------------+
                    |       Express API Gateway Cluster   |
                    +--------+-------------------+--------+
                             |                   |
            +----------------+                   +----------------+
            | Persistence                                         | Async Queue
            v                                                     v
   +--------------------+                               +--------------------+
   |  MongoDB Cluster   |                               |  Redis + BullMQ    |
   | (User/Prob/Submits)|                               | (Job Queue Broker) |
   +--------------------+                               +---------+----------+
                                                                  |
                                                                  v Dequeue Job
                                                        +---------+----------+
                                                        | Worker Pool Node   |
                                                        +---------+----------+
                                                                  | Spawns Sandbox
                                                                  v
                                                        +---------+----------+
                                                        | Hardened Docker    |
                                                        | Execution Engine   |
                                                        +--------------------+
    </div>

    <!-- 2. SYSTEM OBJECTIVES -->
    <h1>2. System Objectives & Requirements Engineering</h1>
    <h2>2.1 Core Objectives</h2>
    <ul>
        <li><strong>Secure Sandbox Execution:</strong> Complete OS-level container isolation of untrusted user code.</li>
        <li><strong>Asynchronous Execution Pipeline:</strong> Non-blocking submission ingestion using job queues.</li>
        <li><strong>Automated Verdict Generation:</strong> Instant feedback (<code>Accepted</code>, <code>Wrong Answer</code>, <code>Time Limit Exceeded</code>, <code>Memory Limit Exceeded</code>, <code>Runtime Error</code>, <code>Compilation Error</code>).</li>
        <li><strong>Role-Based Access Control:</strong> Differentiated permissions for regular users and platform administrators.</li>
        <li><strong>High Concurrency & Low Latency:</strong> API response times &lt; 150 ms (p95) and steady queue throughput under peak traffic.</li>
    </ul>

    <h2>2.2 Non-Functional Requirements & SLAs</h2>
    <table>
        <thead>
            <tr><th>Category</th><th>Target SLA</th><th>Implementation Strategy</th></tr>
        </thead>
        <tbody>
            <tr><td><strong>Availability</strong></td><td>99.9% Uptime</td><td>Multi-instance deployment with load-balanced API nodes and MongoDB Replica Set.</td></tr>
            <tr><td><strong>API Latency</strong></td><td>&lt; 150 ms (p95)</td><td>Redis caching for problem queries; non-blocking event loop.</td></tr>
            <tr><td><strong>Verdict Latency</strong></td><td>&lt; 3.0 seconds (p95)</td><td>Redis + BullMQ / Celery asynchronous job queue with parallel Worker container pool.</td></tr>
            <tr><td><strong>Security Isolation</strong></td><td>100% Host Protection</td><td>Ephemeral Docker containers, <code>cgroups v2</code>, custom <code>seccomp</code> filters, read-only rootfs.</td></tr>
        </tbody>
    </table>

    <div class="page-break"></div>

    <!-- 3. TECH STACK & DESIGN DECISIONS -->
    <h1>3. Technology Stack & Design Rationale</h1>
    <table>
        <thead>
            <tr><th>Component</th><th>Selected Technology</th><th>Alternative Evaluated</th><th>Technical Rationale</th></tr>
        </thead>
        <tbody>
            <tr><td><strong>Frontend</strong></td><td>React 18 + Vite</td><td>Angular / Vue.js</td><td>Component-driven SPA architecture, fast HMR bundling, Monaco Code Editor integration.</td></tr>
            <tr><td><strong>Backend API</strong></td><td>Node.js / Express or Django</td><td>Python FastAPI / Spring Boot</td><td>Non-blocking single-threaded event loop (or Django battery-included ORM & admin) for rapid REST routing.</td></tr>
            <tr><td><strong>Job Queue</strong></td><td>Redis + BullMQ / Celery</td><td>RabbitMQ / Kafka</td><td>Sub-millisecond in-memory speed. Native job state management, retries, and worker concurrency controls.</td></tr>
            <tr><td><strong>Database</strong></td><td>MongoDB / PostgreSQL</td><td>MySQL / DynamoDB</td><td>Dynamic schema adaptation for problem metadata and high write throughput for submission audit logs.</td></tr>
            <tr><td><strong>Execution Sandbox</strong></td><td>Docker Containers</td><td>VM (QEMU) / AWS Lambda</td><td>Near-zero container startup latency (&lt;100ms) with Linux <code>cgroups v2</code> and <code>seccomp</code> OS isolation.</td></tr>
        </tbody>
    </table>

    <!-- 4. DATABASE DESIGN -->
    <h1>4. Database Design & Schemas</h1>
    <h2>4.1 Data Models Overview</h2>
    <ul>
        <li><strong>Users Collection:</strong> Stores user profiles, bcrypt hashed passwords, roles (<code>User</code> / <code>Admin</code>), and solving stats.</li>
        <li><strong>Problems Collection:</strong> Stores problem titles, URL slugs, statement markdown, difficulty ratings, time/memory limits, and sample input/output.</li>
        <li><strong>TestCases Collection:</strong> Stores hidden and public evaluation input/expected output pairs linked to <code>problemId</code>.</li>
        <li><strong>Submissions Collection:</strong> Audit log storing submitted source code, language, evaluation verdict, execution time (ms), and memory usage (KB).</li>
    </ul>

    <!-- 5. REST API SPECIFICATION -->
    <h1>5. REST API Design Map</h1>
    <table>
        <thead>
            <tr><th>Method</th><th>Endpoint</th><th>Access</th><th>Description</th></tr>
        </thead>
        <tbody>
            <tr><td><code>POST</code></td><td>/api/auth/signup</td><td>Public</td><td>Register new user account</td></tr>
            <tr><td><code>POST</code></td><td>/api/auth/login</td><td>Public</td><td>Authenticate user & return JWT session token</td></tr>
            <tr><td><code>GET</code></td><td>/api/problems</td><td>Public</td><td>Search and list problem catalog</td></tr>
            <tr><td><code>GET</code></td><td>/api/problems/:id</td><td>Public</td><td>Fetch single problem statement details</td></tr>
            <tr><td><code>POST</code></td><td>/api/problems</td><td>Admin Only</td><td>Create new problem statement</td></tr>
            <tr><td><code>POST</code></td><td>/api/testcases</td><td>Admin Only</td><td>Upload hidden evaluation test cases</td></tr>
            <tr><td><code>POST</code></td><td>/api/submissions</td><td>Protected</td><td>Submit code solution for async evaluation</td></tr>
            <tr><td><code>GET</code></td><td>/api/submissions/:id</td><td>Protected</td><td>Poll submission verdict and metrics</td></tr>
            <tr><td><code>GET</code></td><td>/api/leaderboard</td><td>Public</td><td>Fetch global user ranking leaderboard</td></tr>
        </tbody>
    </table>

    <div class="page-break"></div>

    <!-- 6. DOCKER SANDBOX SECURITY -->
    <h1>6. Docker Sandbox Security & Threat Analysis</h1>
    <p>To guarantee host safety when running untrusted user code, Docker containers are instantiated using strict security flags:</p>
    <pre><code>docker run --rm \
  --name sandbox_sub_98765 \
  --network none \
  --memory 256m \
  --memory-swap 256m \
  --cpus 1.0 \
  --pids-limit 64 \
  --read-only \
  --user 10001:10001 \
  --security-opt profile=./docker/seccomp.json \
  --cap-drop ALL \
  -v /tmp/sub_98765:/sandbox:ro \
  cpp-runner-engine /sandbox/run.sh</code></pre>

    <h2>Threat Mitigation Matrix</h2>
    <table>
        <thead>
            <tr><th>Threat Vector</th><th>Impact</th><th>Exploit Mechanism</th><th>Architectural Mitigation Strategy</th></tr>
        </thead>
        <tbody>
            <tr><td><strong>Fork Bomb Attack</strong></td><td>CRITICAL</td><td>Submissions creating infinite child processes.</td><td><code>--pids-limit 64</code> enforced via Linux PIDs cgroup.</td></tr>
            <tr><td><strong>Memory Exhaustion</strong></td><td>HIGH</td><td>Allocating huge RAM arrays.</td><td><code>--memory 256m</code> enforced via memory cgroup. Kernel OOM Killer terminates container safely.</td></tr>
            <tr><td><strong>Infinite Loop / CPU Spike</strong></td><td>HIGH</td><td><code>while(true)</code> hogging CPU cycles.</td><td>Hard wall-clock worker timeout (5s) + <code>--cpus 1.0</code> CPU quota.</td></tr>
            <tr><td><strong>Host File Tampering</strong></td><td>CRITICAL</td><td>Code reading `/etc/passwd` or host files.</td><td>Read-only rootfs (<code>--read-only</code>) + read-only volume mount (<code>:ro</code>).</td></tr>
            <tr><td><strong>Network Exfiltration</strong></td><td>CRITICAL</td><td>Code opening sockets to upload host keys.</td><td><code>--network none</code> flag completely unlinks container network interfaces.</td></tr>
        </tbody>
    </table>

    <!-- 7. DEFENSE Q&A -->
    <h1>7. Architectural Design Q&A / Review Defense Guide</h1>
    <div class="alert">
        <div class="alert-title">Q1: Why did you choose asynchronous execution over synchronous execution?</div>
        Code evaluation involves compilation and running against multiple test cases, taking several seconds. Synchronous processing would block API gateway threads, leading to HTTP 504 timeouts. Asynchronous queues decouple request ingestion from processing, returning an instant 202 Accepted response.
    </div>

    <div class="alert">
        <div class="alert-title">Q2: How do cgroups and seccomp protect the host system?</div>
        <strong>cgroups (Control Groups)</strong> limit physical hardware access (RAM capped to 256MB, PIDs capped to 64). <strong>seccomp (Secure Computing Mode)</strong> filters system calls, blocking dangerous kernel primitives like <code>execve</code>, <code>socket</code>, or <code>ptrace</code>.
    </div>

    <!-- 8. CONCLUSION -->
    <h1>8. Conclusion</h1>
    <p>This High-Level Design defines a scalable, secure, and production-oriented blueprint for the <strong>Online Judge Platform</strong>. Decoupling request handling from execution using message queues guarantees high API availability under heavy load. Hardening Docker execution sandboxes via Linux kernel security primitives provides complete host protection against malicious code exploits.</p>

</body>
</html>
"""

html_path = "d:\\project HLD\\Online_Judge_Platform_HLD_Document.html"
pdf_path = "d:\\project HLD\\Online_Judge_Platform_HLD_Specification.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML master document written to {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Executing Microsoft Edge PDF compilation...")
res = subprocess.run(cmd, capture_output=True, text=True)

if os.path.exists(pdf_path):
    print(f"SUCCESS: PDF generated successfully at {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
else:
    print("PDF generation failed:", res.stderr)
