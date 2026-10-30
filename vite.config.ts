import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Lightweight real-time LAN relay plugin for multi-device testing over Wi-Fi (0.0.0.0 / 192.168.x.x)
 * Enables multiple phones and laptops on the same Wi-Fi to sync rooms via Server-Sent Events (SSE)
 */
function lanMultiplayerPlugin(): Plugin {
  const rooms = new Map<string, unknown>()
  const subscribers = new Map<string, Set<any>>()

  return {
    name: 'lan-multiplayer-relay',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Universal CORS headers for local LAN devices
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)

        // 1. SSE Realtime Stream: GET /api/multiplayer/events?code=ROOMCODE
        if (req.method === 'GET' && url.pathname === '/api/multiplayer/events') {
          const code = url.searchParams.get('code')?.toUpperCase()
          if (!code) {
            res.statusCode = 400
            res.end('Missing room code')
            return
          }

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          })

          if (!subscribers.has(code)) {
            subscribers.set(code, new Set())
          }
          const subs = subscribers.get(code)!
          subs.add(res)

          // Send current room state immediately upon connection
          const current = rooms.get(code)
          if (current) {
            res.write(`data: ${JSON.stringify(current)}\n\n`)
          }

          // Ping interval to keep socket connection alive on mobile
          const pingInterval = setInterval(() => {
            try {
              res.write(': keepalive\n\n')
            } catch (e) {
              clearInterval(pingInterval)
            }
          }, 15000)

          req.on('close', () => {
            clearInterval(pingInterval)
            subs.delete(res)
            if (subs.size === 0) subscribers.delete(code)
          })
          return
        }

        // 2. Room State Sync: POST /api/multiplayer/room
        if (req.method === 'POST' && url.pathname === '/api/multiplayer/room') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const code = (data?.code || '').toUpperCase()
              if (code && data) {
                rooms.set(code, data)
                const subs = subscribers.get(code)
                if (subs) {
                  const message = `data: ${JSON.stringify(data)}\n\n`
                  subs.forEach((clientRes) => {
                    try { clientRes.write(message) } catch (e) {}
                  })
                }
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, room: data }))
            } catch (err: unknown) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Invalid payload' }))
            }
          })
          return
        }

        // 3. Room State Fetch: GET /api/multiplayer/room?code=ROOMCODE
        if (req.method === 'GET' && url.pathname === '/api/multiplayer/room') {
          const code = url.searchParams.get('code')?.toUpperCase()
          const room = code ? rooms.get(code) : null
          res.setHeader('Content-Type', 'application/json')
          if (room) {
            // Return room both nested and top-level for maximum client compatibility
            const roomObj = typeof room === 'object' && room !== null ? (room as Record<string, unknown>) : {}
            res.end(JSON.stringify({ success: true, room: roomObj, ...roomObj }))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ success: false, error: 'Room not found' }))
          }
          return
        }

        // 4. WebRTC Voice Signal Relay: POST /api/multiplayer/voice-signal
        if (req.method === 'POST' && url.pathname === '/api/multiplayer/voice-signal') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const code = (data?.roomCode || '').toUpperCase()
              if (code) {
                const subs = subscribers.get(code)
                if (subs) {
                  const message = `data: ${JSON.stringify({ type: 'VOICE_SIGNAL', payload: data })}\n\n`
                  subs.forEach((clientRes) => {
                    try { clientRes.write(message) } catch (e) {}
                  })
                }
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err: unknown) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Invalid signal payload' }))
            }
          })
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), lanMultiplayerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    // Enable seamless connections from any LAN IP or mobile device
    allowedHosts: true,
    proxy: {
      '/ws/bhabhi': {
        target: 'ws://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: true,
    allowedHosts: true,
  },
})
