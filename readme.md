# Toguru Client for Node.js

```bash
$ yarn add toguru-client
```

## Usage

Client usage:

```typescript
import ToguruClient from 'toguru-client'

const client: ToguruClient.ToguruClientInstance = ToguruClient({
    endpoint: 'https://example.com/togglestate',
    refreshInterval: 60 * 1000, // 1 minute
})

const user: ToguruClient.ToguruUser = {
    uuid: 'ad89f957-d646-1111-1111-a02c9aa7faba',
    culture: 'de-DE',
    forcedToggles: {
        t2: true,
    },
}

client.isToggleEnabled('test-toggle', user)
client.toggleNamesForService('service')
client.togglesForService('service', user)
```

### Express middleware usage:

```typescript
import ToguruMiddleware, { ToguruMiddlewareInstance } from 'toguru-client/express'

const toguruMdw: ToguruMiddlewareInstance = ToguruMiddleware({
    endpoint: 'https://example.com/togglestate',
    refreshInterval: 60 * 1000, // 1 minute
    cookieName: 'as24Visitor',
    cultureCookieName: 'culture',
})

app.get('/toggle-test', toguruMdw, (req: Request, res: Response) => {
    if (req.toguru && req.toguru.isToggleEnabled('a')) {
        res.send(`Yes`)
    } else {
        res.send(`No`)
    }

    // req.toguru.isToggleEnabled('name') // true
    // req.toguru.togglesForService('service') // {'service-toggle': true}
    // req.toguru.toggleNamesForService('service-name') // ['service-toggle']
    // req.toguru.toggleStringForService('service-name') // toguru=service-toggle=true|service-toggle-2=false`
})
```

## Development
