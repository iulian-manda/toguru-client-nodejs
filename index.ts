import _client, { ToguruClient } from './src/client'
import * as _expressBridge from './src/express/bridge'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            toguru?: ToguruClient
        }
    }
}

export const client = _client

export const express = {
    middleware: _expressBridge.middleware,
    client: _expressBridge.expressClient,
}
