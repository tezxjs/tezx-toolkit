// profiler.ts
import { Context, Middleware, NextCallback } from 'tezx';
import { Config } from "tezx/config";
import { ProfileResult, ProfilerOptions, ProfilerPlugin, StorageAdapter } from './types.js';
// Main profiler middleware
export function profiler<T extends Record<string, any> = {}>(options: ProfilerOptions = {}): Middleware<T> {
    const {
        route = "/__profiler",
        excludePaths = [],
        enableProfiler = true,
        disableRoute = false,
        metrics = ["time", "memory"],
        storage,
        plugins = [],
    } = options;

    return async (ctx: Context<T>, next: NextCallback) => {
        if (!enableProfiler) {
            // Guard clause with response
            return ctx.status(403).json({
                success: false,
                message: "Profiler is disabled in this environment."
            });
        }
        if (ctx.req.pathname === route && !disableRoute) {
            const systemStats = {
                uptime: process?.uptime(),
                memoryUsage: process?.memoryUsage(),
                cpuUsage: process?.cpuUsage(),
                timestamp: new Date(),
            };
            const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
            const formatMicroseconds = (μs: number) => `${(μs / 1000).toFixed(2)} ms`;

            return ctx.html(
                `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>TezX Profiler</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 40px;
                background: #f9fafb;
                color: #333;
            }

            h1 {
                font-size: 24px;
                color: #111;
            }

            h2 {
                font-size: 20px;
                margin-top: 30px;
            }

            table {
                border-collapse: collapse;
                width: 100%;
                margin-top: 10px;
                background: white;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                overflow: hidden;
            }

            th,
            td {
                padding: 12px 16px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }

            th {
                background-color: #f3f4f6;
                font-weight: 600;
            }

            tr:hover {
                background-color: #f9fafb;
            }

            .container {
                max-width: 900px;
                margin: auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>TezX Profiler - System Stats</h1>

            <h2>General</h2>
            <table>
                <tr>
                    <th>Uptime (sec)</th>
                    <td>${systemStats?.uptime?.toFixed(2)}</td>
                </tr>
                <tr>
                    <th>Timestamp</th>
                    <td>${systemStats?.timestamp?.toISOString()}</td>
                </tr>
            </table>

            <h2>Memory Usage</h2>
            <table>
                ${Object.entries(systemStats?.memoryUsage || {})?.map(([key, value]) => `<tr>
                    <th>${key}</th>
                    <td>${formatBytes(value)}</td>
                </tr>`)?.join('')}
            </table>

            <h2>CPU Usage</h2>
            <table>
                ${Object.entries(systemStats?.cpuUsage || {})?.map(([key, value]) => `<tr>
                    <th>${key}</th>
                    <td>${formatMicroseconds(value)}</td>
                </tr>`)?.join('')}
            </table>
        </div>
    </body>
</html>`
            );
        }


        if (excludePaths.includes(ctx.req.pathname)) {
            return next();
        }

        for (const plugin of plugins) {
            plugin.beforeProfile?.();
        }

        const start = performance?.now();
        const startMem = process?.memoryUsage();
        const startCpu = process?.cpuUsage();
        await next();

        const end = performance?.now();
        const endMem = process?.memoryUsage();
        const endCpu = process?.cpuUsage();

        const result: ProfileResult = {
            name: options.name || "default",
            duration: +(end - start).toFixed(2),
            timestamp: new Date(),
            method: ctx.req.method,
            path: ctx.req.pathname,
        };

        if (metrics.includes("memory")) {
            result.memoryUsage = {
                rss: Math.max(0, endMem.rss - startMem.rss),
                heapTotal: Math.max(0, endMem?.heapTotal - startMem?.heapTotal),
                heapUsed: Math.max(0, endMem?.heapUsed - startMem?.heapUsed),
                external: Math.max(0, endMem?.external - startMem?.external),
                arrayBuffers: Math.max(0, endMem?.arrayBuffers - startMem?.arrayBuffers),
            };
        }

        if (metrics.includes("cpu")) {
            result.cpuUsage = {
                user: Math.max(0, endCpu.user - startCpu.user),
                system: Math.max(0, endCpu.system - startCpu.system),
            };
        }

        Config.debugging.info(`[Profiler] ${ctx.req.method} ${ctx.req.pathname} -> ${result.duration} ms`, result.memoryUsage || "")

        if (storage) {
            await storage.save(result);
        }
        for (const plugin of plugins) {
            plugin.afterProfile?.(result);
        }
    };
}

declare const Deno: any;

export function createRotatingFileStorage(filePath: string, maxSize: number): StorageAdapter {
    let currentSize = 0;
    let fileWriter: { write: (text: string) => Promise<void>; close?: () => Promise<void> };
    // Platform detection

    async function openNewFile(path: string) {
        const file = Bun.file(path);
        const writer = await file.writer();
        fileWriter = {
            write: (text) => Promise.resolve(writer.write(text)).then(() => { }),
            close: () => Promise.resolve(writer.end()).then(() => { })
        };
    }

    async function rotateFile() {
        await fileWriter.close?.();
        const timestamp = Date.now();
        const rotatedFilePath = `${filePath}.${timestamp}`;
        await openNewFile(rotatedFilePath);
        currentSize = 0;
    }

    // Initialize first file
    openNewFile(filePath);

    return {
        async save(result: ProfileResult): Promise<void> {
            const data = JSON.stringify(result, null, 2) + ",\n";
            const dataSize = new TextEncoder().encode(data).length;
            if (currentSize + dataSize > maxSize) {
                await rotateFile();
            }
            await fileWriter.write(data);
            currentSize += dataSize;
        },
    };
}

export type {
    ProfileResult, ProfilerOptions, ProfilerPlugin, StorageAdapter
};

export default {
    profiler,
    createRotatingFileStorage
}
