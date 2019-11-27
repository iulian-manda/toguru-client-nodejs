import { ToggleState } from '../models/ToggleState'
import { Request, Response, NextFunction } from 'express'
import { Toggle } from '../models/Toggle'
import { Toggles } from '../models/Toggles'

export const stubToguruMiddleware = (overrides: ToggleState[]) => (req: Request, _: Response, next: NextFunction) => {
    req.toguru = {
        isToggleEnabled: (toggle: Toggle) => overrides.find((t) => t.id == toggle.id)?.enabled ?? toggle.default,
        togglesForService: (_: String) => new Toggles([]),
    }
    next()
}
