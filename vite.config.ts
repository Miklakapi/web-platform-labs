import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    plugins: [
        {
            name: 'serve-root-sw',

            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    if (req.url !== '/sw.js') {
                        next()
                        return
                    }

                    try {
                        const result = await server.transformRequest('/src/app/sw.ts')

                        if (!result?.code) {
                            res.statusCode = 500
                            res.end('Failed to transform service worker')
                            return
                        }

                        res.setHeader('Content-Type', 'application/javascript')
                        res.setHeader('Cache-Control', 'no-cache')
                        res.end(result.code)
                    } catch (error) {
                        res.statusCode = 500
                        res.end(String(error))
                    }
                })
            }
        }
    ]
})
