import { Router } from "express";
const router = Router();
import { login, logout, register } from "../controllers/authController.js";
import { validateLoginInput, validateRegisterInput } from "../middleware/validationMiddleware.js";
import rateLimiter from "express-rate-limit";

const apiLimiter = rateLimiter({
    windowMs:5*60*1000,
    max: 10,
    message: {message: 'IP rate limit exceeded, retry in 5 minutes'}
})

router.post('/register', apiLimiter, validateRegisterInput, register);
router.post('/login', apiLimiter, validateLoginInput, login);
router.get('/logout', logout);

export default router