/**
 * Worker Manager
 * 
 * Manages communication with the syllable processor Web Worker.
 * Provides a promise-based API for processing text lines with automatic
 * error recovery and main-thread fallback support.
 */

import type { WorkerRequest, WorkerResponse, SyllableData } from '../types';
import { logger } from './logger';

type PromiseExecutor<T> = {
  resolve: (data: T) => void;
  reject: (error: Error) => void;
};

// Dynamically import the processLine function type for the fallback
type ProcessLineFn = (text: string) => SyllableData;

export class WorkerManager {
  private worker: Worker;
  private requestId: number = 0;
  private pendingRequests: Map<number, PromiseExecutor<SyllableData>> = new Map();
  // Track pending requests by line number to handle cancellation
  private lineRequestMap: Map<number, number> = new Map();

  // Recovery and fallback state
  private workerFailureCount = 0;
  private readonly MAX_WORKER_FAILURES = 3;
  private useFallback = false;
  private processLineFallback: ProcessLineFn | null = null;

  constructor() {
    logger.debug('WorkerManager', 'Initializing Web Worker...');
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    // Create the Web Worker using Vite's special syntax
    const newWorker = new Worker(
      new URL('../workers/syllableProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    logger.debug('WorkerManager', 'Worker created successfully');

    // Set up message handler
    newWorker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleResponse(event.data);
    };

    // Enhanced error handler with recovery logic
    newWorker.onerror = (error) => {
      logger.error('WorkerManager', 'Worker error:', error);
      this.workerFailureCount++;

      // Reject all current requests
      this.pendingRequests.forEach(({ reject }) => {
        reject(new Error('Worker encountered an error and is restarting.'));
      });
      this.pendingRequests.clear();
      this.lineRequestMap.clear();

      if (this.workerFailureCount >= this.MAX_WORKER_FAILURES) {
        logger.warn('WorkerManager', `Worker failed ${this.workerFailureCount} times. Switching to main-thread fallback.`);
        this.useFallback = true;
        newWorker.terminate();
      } else {
        logger.warn('WorkerManager', `Attempting to restart worker (failure #${this.workerFailureCount}).`);
        newWorker.terminate();
        this.worker = this.createWorker();
      }
    };
    
    return newWorker;
  }

  /**
   * Process a line of text and return syllable data
   */
  async processLine(text: string, lineNumber: number): Promise<SyllableData> {
    // Check for fallback mode
    if (this.useFallback) {
      return this.processLineOnMainThread(text);
    }
    
    // Cancel any existing request for the same line to prevent race conditions
    if (this.lineRequestMap.has(lineNumber)) {
      const oldRequestId = this.lineRequestMap.get(lineNumber)!;
      const pending = this.pendingRequests.get(oldRequestId);
      if (pending) {
        pending.reject(new Error('Request superseded'));
        this.pendingRequests.delete(oldRequestId);
      }
    }

    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      logger.debug('WorkerManager', 'Sending request', { id, lineNumber, textLength: text.length });
      
      // Store promise handlers
      this.pendingRequests.set(id, { resolve, reject });
      this.lineRequestMap.set(lineNumber, id); // Track current request ID for this line

      // Send request to worker
      const request: WorkerRequest = {
        id,
        type: 'process-line',
        text,
        lineNumber,
      };

      try {
        this.worker.postMessage(request);
      } catch (error) {
        logger.error('WorkerManager', 'Failed to send message:', error);
        this.pendingRequests.delete(id);
        this.lineRequestMap.delete(lineNumber);
        reject(error instanceof Error ? error : new Error('Failed to send message to worker'));
      }
    });
  }

  /**
   * Fallback processing function on the main thread
   */
  private async processLineOnMainThread(text: string): Promise<SyllableData> {
    if (!this.processLineFallback) {
      try {
        const { processLine } = await import('../workers/syllableProcessor.worker');
        this.processLineFallback = processLine;
      } catch (e) {
        logger.error('WorkerManager', 'Failed to load fallback processor:', e);
        throw new Error('Fallback processor failed to load.');
      }
    }
    return this.processLineFallback(text);
  }

  /**
   * Handle response from worker
   */
  private handleResponse(response: WorkerResponse): void {
    logger.debug('WorkerManager', 'Received response', { id: response.id, type: response.type });
    
    const pending = this.pendingRequests.get(response.id);
    
    // Clean up line request map regardless of whether the request is found
    if (response.lineNumber !== undefined) {
      // Only clear if it's the current request for that line
      if (this.lineRequestMap.get(response.lineNumber) === response.id) {
        this.lineRequestMap.delete(response.lineNumber);
      }
    }
    
    if (!pending) {
      // This is expected if the request was superseded, so we don't warn.
      logger.debug('WorkerManager', `Received response for a superseded or unknown request ID: ${response.id}`);
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.type === 'error') {
      pending.reject(new Error(response.error || 'Unknown worker error'));
    } else if (response.type === 'line-result' && response.data) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error('Invalid response from worker'));
    }
  }

  /**
   * Terminate the worker and clean up
   */
  terminate(): void {
    this.worker.terminate();
    
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('Worker was terminated'));
    });
    this.pendingRequests.clear();
    this.lineRequestMap.clear();
  }

  /**
   * Get the number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Export singleton instance
let workerManagerInstance: WorkerManager | null = null;

/**
 * Get or create the singleton worker manager instance
 */
export function getWorkerManager(): WorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new WorkerManager();
  }
  return workerManagerInstance;
}

/**
 * Clean up the worker manager (useful for hot module replacement)
 */
export function cleanupWorkerManager(): void {
  if (workerManagerInstance) {
    workerManagerInstance.terminate();
    workerManagerInstance = null;
  }
}
