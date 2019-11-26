import _client from './src/client'
import * as _expressBridge from './src/express/bridge'

export const client = _client

export const express = {
    middleware: _expressBridge.middleware,
    client: _expressBridge.expressClient,
}
