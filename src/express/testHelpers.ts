import { ToggleState } from '../models/ToggleState'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { Toggle } from '../models/Toggle'
import { Toggles } from '../models/Toggles'
import { TogglingApi } from '../client'

export const stubClient = (overrides: ToggleState[]) => (_: Request): TogglingApi => ({
    isToggleEnabled: (toggle: Toggle) => overrides.find((t) => t.id == toggle.id)?.enabled ?? toggle.default,
    togglesForService: (_: string) => new Toggles([]),
})

export const stubMiddleware = (overrides: ToggleState[]) => (req: Request, _: Response, next: NextFunction) => {
    req.toguru = stubClient(overrides)(req)
    next()
}
