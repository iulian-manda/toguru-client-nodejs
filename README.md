# Toguru Client for Node.js

> A `TypeScript` client for integrating Toguru into a `Node.js` environment

> [![Actions Status](https://github.com/Scout24/toguru-client-nodejs/workflows/Build/badge.svg)](https://github.com/Scout24/toguru-client-nodejs/actions) ![npm](https://img.shields.io/npm/v/toguru-client)

<!-- installing doctoc: https://github.com/thlorenz/doctoc#installation -->
<!-- tocdoc command: doctoc ./README.md --maxlevel 3 --notitle -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Base Client](#base-client)
    -   [Express Bridge](#express-bridge)
-   [Testing](#testing)
-   [Development](#development)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

You can install the library with your package manager of choice

```bash
$ yarn add toguru-client
# or
$ npm install toguru-client
```

The client is fully written in `TypeScript` and comes with types out of the box.

## Usage

### Base Client

The library provides a base `Toguru` client that is independent of the framework or environment used, and can be used for `AWS lambdas`, `Kafka` streams, generic scripts, etc where toggling functionality might be needed. It allows computing toggle activations based on an activation context. For `web` application contexts, we recommend using the more specialized `Express` bridge, see below.

```typescript
import { toguruClient, TogglingApiByActivationContext } from '@autoscout24/toguru-client'

const client: TogglingApiByActivationContext = toguruClient({
    endpoint: 'https://example.com/togglestate',
    refreshIntervalMs: 60 * 1000, // 1 minute
})
```

Once we have instantiated the `client`, it will poll the `Toguru` backend automatically and fetch all toggle information. The client needs an `ActivationContext` (`user` identifier, possible forced toggles, etc) which we can provide

```ts
const activationContext: ActivationContext = {
    uuid: 'ad89f957-d646-1111-1111-a02c9aa7faba',
    forcedToggles: {
        fooToggle: true,
    },
}
```

We can then use this context to finally compute toggle activations

```ts
client(activationContext).isToggleEnabled({ id: 'test-toggle', default: false }) // based on toguru data, fallback to `false`
client(activationContext).isToggleEnabled({ id: 'fooToggle', default: false }) // `true`
client(activationContext).togglesForService('service') // `Toggles` based on toguru data
```

### Express Bridge

When working with a web application, it makes sense to compute toggle information based on the client's `Request`. The library provides an [Express](https://expressjs.com/) bridge that takes a base client and uses it to compute toggle activations based on a `Request`

**Request-based client**

We can create a client that will compute the activation context based on a `Request`.

```ts
import { client, toguruExpressBridge } from '@autoscout24/toguru-client'


const client = client({...}) // instantiate the base toguru client

const toguruExpressClient = toguruExpressBridge.client({
    client,
    extractors: {
        uuid: toguruExpressBridge.requestExtractors.cookieValue('user-id') // will attempt to pull the user uuid from the `user-id` cookie
    }
})
```

The `extractors` key allows customizing the behaviour, and will use certain defaults if not specified. When they are not specified, they will use `defaults`. After the express client is instantiated, it can be used to determine toggle activations

```ts
app.get('/some-route', (req, res) => {
      const testToggleIsOn = client(req).isToggleEnabled({ id: 'test-toggle', default: false })
      // ...
    }
))
```

**Middleware**

The library also provides an `Express middleware` that will augment then `Request` object with an additional `toguru` attribute. The instantiation options are the same as the express client above, and can be as follows

```ts
const toguruClientMiddleware = toguruExpressBridge.middleware(...) // same as `toguruExpressBridge.client`
app.get('/some-route', toguruClientMiddleware, (req, res) => {
      const testToggleIsOn = req.toguru.isToggleEnabled({ id: 'test-toggle', default: false })
      // ...
    }
))
```

## Testing

In general, we recommend parametrizing your main application to take a toguru client interface, and instantiating the client itself at the very edge of your application (typically `index.ts`). This allows you to use different clients during tests that you can fully control without the need to introduce any mocking tools.

### Express

Following the pattern align above, a typical `Express` application will look like 

```ts
const application = (
  toguruMiddleware: (req: Request, resp: Response, next: NextFunction) => void
) => {
  const app = express()
  app.get('/toguru-test', toguruMiddleware,...)
})
```

During tests, we can pass the `express.stubToguruMiddleware` or `express.stubClient`, depending on what the app is using, that easily allows you to instantiate the middleware/client with a given set of toggles, falling back to the toggle defaults for the rest.

```ts
stubToguruMiddleware([{ id: 'some-toggle', enabled: false }])
```
