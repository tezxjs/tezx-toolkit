# @tezx/profiler

A lightweight, extensible profiling middleware for the [TezX](https://www.npmjs.com/package/tezx) framework. This module enables detailed tracking of runtime performance metrics, memory usage, CPU statistics, and supports custom plugins and rotating file storage.

---

## 🚀 Features

- ⏱️ Measure route execution time.
- 💾 Monitor memory usage in MB.
- ⚙️ Capture CPU usage in milliseconds.
- 📊 System stats endpoint (`/__profiler`) with a clean UI.
- 🔌 Plugin hooks (`beforeProfile`, `afterProfile`).
- 📁 Rotating file storage for logs.
- ✅ Written in TypeScript with full type safety.

---

## 📦 Installation

```bash
npm install @tezx/profiler
```

---

## 🛠️ Usage Example

### Basic Setup

```ts
import { TezX } from 'tezx';
import { profiler, createRotatingFileStorage } from '@tezx/profiler';

const app =new TezX();

app.use(
  profiler({
    route: '/__profiler',
    excludePaths: ['/favicon.ico'],
    metrics: ['time', 'memory', 'cpu'],
    storage: createRotatingFileStorage('./profiler.log', 1024 * 1024), // Rotate every 1MB
    plugins: [],
  })
);

app.get('/', (ctx) => ctx.json({ message: 'Hello World' }));

```

---

## 🌐 Profiler UI

Visit your app at:

```bash
http://localhost:3000/__profiler
```

You'll see:

- ✅ Uptime (seconds)
- ✅ Timestamp
- ✅ Memory Usage (rss, heapTotal, heapUsed, etc.) in MB
- ✅ CPU Usage (user/system) in milliseconds

---

## ⚙️ Profiler Options

| Option           | Type                                        | Default         | Description                             |
|------------------|---------------------------------------------|-----------------|-----------------------------------------|
| `route`          | `string`                                    | `/__profiler`   | Path to view system stats               |
| `excludePaths`   | `string[]`                                  | `[]`            | Paths to ignore                         |
| `metrics`        | `(\"time\" \| \"memory\" \| \"cpu\")[]`     | `['time', 'memory']` | Metrics to collect                |
| `storage`        | `StorageAdapter`                            | `undefined`     | Save profile results                   |
| `plugins`        | `ProfilerPlugin[]`                          | `[]`            | Hook into the profiling lifecycle      |

---

## 🔌 Plugins Example

```typescript
const myPlugin = {
  beforeProfile: () => console.log('Starting profiling...'),
  afterProfile: (result) => console.log('Profile completed:', result),
};

app.use(profiler({ plugins: [myPlugin] }));
```

---

## 🗃️ Rotating File Storage Example

```typescript
const storage = createRotatingFileStorage('./profiler.log', 1024 * 1024); // 1MB rotation

app.use(profiler({ storage }));
```

- File automatically rotates when it reaches the configured size.

---

## 🧑‍💻 Example Profile Output

```json
{
  "name": "default",
  "duration": 6.25,
  "timestamp": "2025-07-06T19:25:47.753Z",
  "method": "GET",
  "path": "/",
  "memoryUsage": {
    "rss": 10485760,
    "heapTotal": 6291456,
    "heapUsed": 4194304,
    "external": 102400,
    "arrayBuffers": 51200
  },
  "cpuUsage": {
    "user": 1416,
    "system": 312
  }
}
```

---

## ⚡ System Stats Breakdown

### Memory Usage

- `rss`: Resident Set Size (total memory allocated for the process)
- `heapTotal`: Total size of allocated heap
- `heapUsed`: Heap actually used
- `external`: Memory used by C++ objects bound to JS
- `arrayBuffers`: Memory allocated for ArrayBuffer

### CPU Usage

- `user`: Time spent in user mode (μs)
- `system`: Time spent in kernel mode (μs)

---
