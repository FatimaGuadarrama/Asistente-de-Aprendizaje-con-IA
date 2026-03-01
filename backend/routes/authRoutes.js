import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Middleware de validación
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Por favor proporciona un correo válido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Por favor proporciona un correo válido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
];

// Rutas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Rutas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;