import * as authService from './auth.service.js'

export const register = async (req, res) => {
    try {
        const result = await authService.register(req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const token = await authService.login(req.body)
        res.json({ token })
    } catch (error) {
        res.status(401).json({ error: error.message })
    }
}
