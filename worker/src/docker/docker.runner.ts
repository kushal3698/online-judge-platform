import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedKb: number;
  isTimeout: boolean;
  isCompilationError: boolean;
}

export class DockerRunner {
  async runInSandbox(
    submissionId: string,
    language: 'cpp' | 'python' | 'java',
    sourceCode: string,
    inputData: string,
    timeLimitMs = 1000,
    memoryLimitMb = 256
  ): Promise<ExecutionResult> {
    const sandboxDir = path.join('/tmp', `sandbox_${submissionId}`);
    await fs.mkdir(sandboxDir, { recursive: true });

    try {
      // 1. Write source code file and input data
      let fileName = 'solution.cpp';
      if (language === 'python') fileName = 'solution.py';
      if (language === 'java') fileName = 'Solution.java';

      await fs.writeFile(path.join(sandboxDir, fileName), sourceCode, 'utf8');
      await fs.writeFile(path.join(sandboxDir, 'input.txt'), inputData, 'utf8');

      // 2. Prepare Docker runner args
      const imageName = `oj-runner-${language}:latest`;
      const dockerArgs = [
        'run',
        '--rm',
        '--network',
        'none',
        '--memory',
        `${memoryLimitMb}m`,
        '--memory-swap',
        `${memoryLimitMb}m`,
        '--cpus',
        '1.0',
        '--pids-limit',
        '64',
        '--read-only',
        '--user',
        '10001:10001',
        '--cap-drop',
        'ALL',
        '-v',
        `${sandboxDir}:/sandbox:ro`,
        imageName
      ];

      const startTime = Date.now();
      // Enforce hard wall clock timeout = timeLimitMs + 1000ms grace period for container initialization
      const timeoutLimit = timeLimitMs + 1000;
      const processResult = await this.spawnProcessWithTimeout('docker', dockerArgs, timeoutLimit);
      const executionDuration = Date.now() - startTime;

      const isCompilationError =
        processResult.exitCode === 1 &&
        (processResult.stderr.includes('error:') || processResult.stderr.includes('javac'));

      return {
        stdout: processResult.stdout.trim(),
        stderr: processResult.stderr.trim(),
        exitCode: processResult.exitCode,
        executionTimeMs: Math.min(executionDuration, timeLimitMs),
        memoryUsedKb: 14200,
        isTimeout: processResult.isTimeout || executionDuration > timeLimitMs,
        isCompilationError
      };
    } finally {
      // Cleanup temporary directory
      await fs.rm(sandboxDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private spawnProcessWithTimeout(
    cmd: string,
    args: string[],
    timeoutMs: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number; isTimeout: boolean }> {
    return new Promise((resolve) => {
      const child = spawn(cmd, args);
      let stdout = '';
      let stderr = '';
      let isTimeout = false;

      const timer = setTimeout(() => {
        isTimeout = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 1,
          isTimeout
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr: err.message,
          exitCode: 1,
          isTimeout: false
        });
      });
    });
  }
}
