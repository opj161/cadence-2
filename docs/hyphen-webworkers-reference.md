# Hyphen Package & Web Workers Reference

> Documentation compiled on November 9, 2025
> 
> This document contains information about the hyphen npm package and Web Workers for the Cadence application.

---

## Table of Contents

1. [Hyphen Package](#hyphen-package)
2. [Web Workers API](#web-workers-api)
3. [Vite Web Worker Configuration](#vite-web-worker-configuration)
4. [TypeScript with Web Workers](#typescript-with-web-workers)

---

## Hyphen Package

The `hyphen` npm package (from the user requirements) provides hyphenation based on Franklin M. Liang's algorithm. It uses patterns from ctan.org to hyphenate text.

### Installation

```bash
npm install hyphen
npm install --save-dev @types/hyphen
```

### Basic Usage

#### Async API (Returns Promise)

```javascript
import { hyphenate } from "hyphen/en";

(async () => {
  const text = "A certain king had a beautiful garden";
  const result = await hyphenate(text);
  // result is "A cer\u00ADtain king had a beau\u00ADti\u00ADful garden"
})();
```

#### Sync API (Returns String)

```javascript
import { hyphenateSync as hyphenate } from "hyphen/en";

const text = "A certain king had a beautiful garden";
const result = hyphenate(text);
// result is "A cer\u00ADtain king had a beau\u00ADti\u00ADful garden"
```

### Soft Hyphen Character

The package inserts the soft hyphen character (`\u00AD`) at syllable boundaries. This is an invisible character that:
- Indicates where words can be broken for line wrapping
- Can be counted to determine syllable count
- **Syllable Count = Number of soft hyphens + 1**

### Example: Counting Syllables

```javascript
import { hyphenate } from "hyphen/en";

async function countSyllables(text) {
  const hyphenated = await hyphenate(text);
  // Count soft hyphens
  const softHyphens = (hyphenated.match(/\u00AD/g) || []).length;
  return softHyphens + 1;
}

// Examples:
// "cat" → "cat" → 0 hyphens → 1 syllable
// "beautiful" → "beau\u00ADti\u00ADful" → 2 hyphens → 3 syllables
// "revolutionary" → "rev\u00ADo\u00ADlu\u00ADtion\u00ADary" → 4 hyphens → 5 syllables
```

### Multilingual Support

```javascript
import { hyphenate as hyphenateEn } from "hyphen/en";
import { hyphenate as hyphenateDe } from "hyphen/de";

(async () => {
  const english = "A certain king had a beautiful garden";
  const englishResult = await hyphenateEn(english);
  
  const german = "Ein gewisser König hatte einen wunderschönen Garten";
  const germanResult = await hyphenateDe(german);
})();
```

### HTML Support

The processor automatically skips HTML tags:

```javascript
import { hyphenate } from "hyphen/en";

(async () => {
  const text = "<blockquote>A certain king had a beautiful garden</blockquote>";
  const result = await hyphenate(text);
  // result is "<blockquote>A cer\u00ADtain king had a beau\u00ADti\u00ADful garden</blockquote>"
})();
```

### Configuration Options

```typescript
interface HyphenateOptions {
  // Array of exception words with manual hyphenation
  exceptions?: string[];
  
  // Character to use for soft hyphen (default: \u00AD)
  hyphenChar?: string;
  
  // Minimum word length to hyphenate (default: 5)
  minWordLength?: number;
}
```

**Usage:**

```javascript
import { hyphenate } from "hyphen/en";

(async () => {
  const text = "A certain king had a beautiful garden";
  
  const result = await hyphenate(text, {
    hyphenChar: "-",  // Use visible hyphen instead of soft hyphen
    minWordLength: 6,  // Only hyphenate words with 6+ characters
    exceptions: ["present", "ta-ble"]  // Manual hyphenation
  });
})();
```

### Factory Function

Create a hyphenator with custom default options:

```javascript
import createHyphenator from "hyphen";
import patterns from "hyphen/patterns/en-us";

const hyphenate = createHyphenator(patterns, {
  async: true,
  exceptions: ["present", "ta-ble"],
  hyphenChar: "\u00AD",
  minWordLength: 5
});

// Now use it
const result = await hyphenate("beautiful garden");
```

### Available Languages

Check the [npm package documentation](https://www.npmjs.com/package/hyphen) for the full list of available language patterns.

---

## Web Workers API

### What are Web Workers?

Web Workers allow JavaScript to run in background threads, separate from the main UI thread. This prevents blocking the user interface during expensive computations.

### Basic Web Worker Pattern

#### Main Thread (main.ts)

```typescript
// Create worker
const worker = new Worker(
  new URL('./worker.ts', import.meta.url),
  { type: 'module' }
);

// Send message to worker
worker.postMessage({ 
  type: 'process',
  data: 'some data'
});

// Receive message from worker
worker.onmessage = (event) => {
  console.log('Received from worker:', event.data);
};

// Handle errors
worker.onerror = (error) => {
  console.error('Worker error:', error);
};

// Terminate worker when done
worker.terminate();
```

#### Worker Thread (worker.ts)

```typescript
// Listen for messages from main thread
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  if (type === 'process') {
    // Do expensive computation
    const result = processData(data);
    
    // Send result back to main thread
    self.postMessage({ 
      type: 'result',
      data: result 
    });
  }
};

function processData(data: string): string {
  // Heavy computation here
  return data.toUpperCase();
}
```

### TypeScript Web Worker Pattern

#### Worker Type Definition (worker.types.ts)

```typescript
// Messages sent TO worker
export interface WorkerRequest {
  id: string;
  type: 'process' | 'cancel';
  data: any;
}

// Messages received FROM worker
export interface WorkerResponse {
  id: string;
  type: 'result' | 'error' | 'progress';
  data: any;
  error?: string;
}
```

#### Typed Worker (worker.ts)

```typescript
import type { WorkerRequest, WorkerResponse } from './worker.types';

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, data } = event.data;
  
  try {
    if (type === 'process') {
      const result = processData(data);
      
      const response: WorkerResponse = {
        id,
        type: 'result',
        data: result
      };
      
      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type: 'error',
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    self.postMessage(response);
  }
};
```

#### Typed Main Thread

```typescript
import type { WorkerRequest, WorkerResponse } from './worker.types';

class WorkerManager {
  private worker: Worker;
  private pendingRequests = new Map<string, {
    resolve: (data: any) => void;
    reject: (error: any) => void;
  }>();

  constructor() {
    this.worker = new Worker(
      new URL('./worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);
  }

  private handleMessage(event: MessageEvent<WorkerResponse>) {
    const { id, type, data, error } = event.data;
    const pending = this.pendingRequests.get(id);
    
    if (!pending) return;
    
    if (type === 'result') {
      pending.resolve(data);
      this.pendingRequests.delete(id);
    } else if (type === 'error') {
      pending.reject(new Error(error));
      this.pendingRequests.delete(id);
    }
  }

  private handleError(error: ErrorEvent) {
    console.error('Worker error:', error);
  }

  async process(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      
      this.pendingRequests.set(id, { resolve, reject });
      
      const request: WorkerRequest = {
        id,
        type: 'process',
        data
      };
      
      this.worker.postMessage(request);
    });
  }

  terminate() {
    this.worker.terminate();
  }
}

// Usage:
const workerManager = new WorkerManager();
const result = await workerManager.process('some data');
```

---

## Vite Web Worker Configuration

### Vite Native Support

Vite has built-in support for Web Workers. No special configuration needed!

### Creating Workers in Vite

#### Using Constructor + URL

```typescript
// Recommended approach
const worker = new Worker(
  new URL('./worker.ts', import.meta.url),
  { type: 'module' }
);
```

#### Using ?worker Suffix

```typescript
// Alternative: use ?worker suffix
import MyWorker from './worker?worker';

const worker = new MyWorker();
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Optional: Worker configuration
  worker: {
    format: 'es',  // 'es' | 'iife'
    plugins: [],   // Additional plugins for workers
    rollupOptions: {
      // Rollup options for worker bundles
    }
  },
  
  // Ensure proper MIME types
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
});
```

### TypeScript Configuration for Workers

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Worker-specific tsconfig (optional)

If you want separate config for workers:

**tsconfig.worker.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "WebWorker"]
  },
  "include": ["src/**/*.worker.ts"]
}
```

---

## Cadence-Specific Implementation

### Syllable Processor Worker

#### syllableProcessor.worker.ts

```typescript
import { hyphenate } from "hyphen/en";

interface ProcessRequest {
  id: string;
  lines: Array<{ 
    lineNumber: number; 
    text: string;
  }>;
}

interface ProcessResponse {
  id: string;
  results: Array<{
    lineNumber: number;
    syllables: number;
    hyphenated: string;
  }>;
  errors: Array<{
    lineNumber: number;
    word: string;
  }>;
}

async function countSyllables(text: string): Promise<number> {
  if (!text.trim()) return 0;
  
  try {
    const hyphenated = await hyphenate(text);
    const softHyphens = (hyphenated.match(/\u00AD/g) || []).length;
    return softHyphens + 1;
  } catch {
    throw new Error(`Could not process: ${text}`);
  }
}

self.onmessage = async (event: MessageEvent<ProcessRequest>) => {
  const { id, lines } = event.data;
  const results = [];
  const errors = [];

  for (const { lineNumber, text } of lines) {
    try {
      const hyphenated = await hyphenate(text);
      const syllables = (hyphenated.match(/\u00AD/g) || []).length + 1;
      
      results.push({ lineNumber, syllables, hyphenated });
    } catch (error) {
      errors.push({ lineNumber, word: text });
    }
  }

  const response: ProcessResponse = {
    id,
    results,
    errors
  };

  self.postMessage(response);
};
```

#### Worker Manager (workerManager.ts)

```typescript
interface ProcessRequest {
  id: string;
  lines: Array<{ lineNumber: number; text: string }>;
}

interface ProcessResponse {
  id: string;
  results: Array<{
    lineNumber: number;
    syllables: number;
    hyphenated: string;
  }>;
  errors: Array<{
    lineNumber: number;
    word: string;
  }>;
}

export class SyllableWorkerManager {
  private worker: Worker;
  private pendingRequests = new Map<string, {
    resolve: (data: ProcessResponse) => void;
    reject: (error: any) => void;
  }>();

  constructor() {
    this.worker = new Worker(
      new URL('./syllableProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);
  }

  private handleMessage(event: MessageEvent<ProcessResponse>) {
    const { id } = event.data;
    const pending = this.pendingRequests.get(id);
    
    if (pending) {
      pending.resolve(event.data);
      this.pendingRequests.delete(id);
    }
  }

  private handleError(error: ErrorEvent) {
    console.error('Worker error:', error);
    
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject }) => {
      reject(error);
    });
    this.pendingRequests.clear();
  }

  async processLines(lines: Array<{ lineNumber: number; text: string }>): Promise<ProcessResponse> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      
      this.pendingRequests.set(id, { resolve, reject });
      
      const request: ProcessRequest = { id, lines };
      this.worker.postMessage(request);
    });
  }

  terminate() {
    this.worker.terminate();
    this.pendingRequests.clear();
  }
}
```

#### Usage in React Component

```typescript
import { useEffect, useRef, useState } from 'react';
import { SyllableWorkerManager } from './utils/workerManager';

function LyricEditor() {
  const workerRef = useRef<SyllableWorkerManager>();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Create worker on mount
    workerRef.current = new SyllableWorkerManager();
    
    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const processText = async (text: string) => {
    if (!workerRef.current) return;
    
    setProcessing(true);
    
    try {
      const lines = text.split('\n').map((text, index) => ({
        lineNumber: index + 1,
        text
      }));
      
      const result = await workerRef.current.processLines(lines);
      
      // Use result.results and result.errors
      console.log('Syllable counts:', result.results);
      console.log('Errors:', result.errors);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {processing && <div>Processing...</div>}
      {/* Editor component */}
    </div>
  );
}
```

---

## Best Practices

### Web Workers

1. **Create once, reuse** - Don't create new workers on every operation
2. **Use message IDs** - Track requests/responses with unique IDs
3. **Handle errors gracefully** - Always implement error handling
4. **Terminate when done** - Clean up workers to free resources
5. **Use TypeScript** - Type your message interfaces
6. **Batch operations** - Send multiple items in one message
7. **Progress updates** - Send progress for long operations
8. **Debounce triggers** - Don't spam the worker with messages

### Hyphen Package

1. **Cache results** - Store hyphenated results for unchanged text
2. **Batch processing** - Process multiple words at once
3. **Handle empty strings** - Check for empty/whitespace-only text
4. **Use async version** - Better performance for large texts
5. **Count soft hyphens** - Simple syllable counting method
6. **Error handling** - Catch and report words that fail to process
7. **Consider language** - Use appropriate language pattern
8. **Minimum word length** - Configure to avoid hyphenating short words

---

**End of Hyphen & Web Workers Reference Document**
