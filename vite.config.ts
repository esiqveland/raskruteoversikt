import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [ react() ],
    server: {
        proxy: {
            '/api': {
                target: 'https://raskrute.logisk.org',
                //target: 'http://localhost:9999',
                changeOrigin: true,
                ws: true,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url, `${proxyReq.protocol}://${proxyReq.host}${proxyReq.path}`);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        //console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        css: true,
        reporters: [ 'verbose' ],
        coverage: {
            reporter: [ 'text', 'json', 'html' ],
            include: [ 'src/**/*' ],
            exclude: [],
        }
    },
})