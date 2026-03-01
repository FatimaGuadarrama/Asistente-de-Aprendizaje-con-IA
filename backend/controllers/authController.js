import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Genera token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

// @desc    Registra nuevo usuario
// @route   POST /api/auth/register
// @access  Público
export const register = async (req, res, next) => {
    try{
        const { username, email, password } = req.body;

        // Verifica si el usuario ya existe
        const userExists = await User.findOne({ $or: [{ email }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error:
                  userExists.email === email
                    ? 'El correo ya está registrado'
                    : 'El nombre de usuario ya está en uso',
                statusCode: 400
            });
        }

        // Crear usuario
        const user = await User.create({
            username,
            email,
            password
        });

        // Genera token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token
            },
            message: 'Usuario registrado correctamente',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Público
export const login = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        // Valida datos de entrada
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona correo y contraseña',
                statusCode: 400
            });
        }

        // Buscar usuario (incluye contraseña para comparación)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                statusCode: 401
            });
        }

        // Verifica contraseña
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                statusCode: 401
            });
        }

        // Genera token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
            token,
            message: 'Inicio de sesión exitoso'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
// @access  Privado
export const getProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/profile
// @access  Privado
export const updateProfile = async (req, res, next) => {
    try{
        const { username, email, profileImage } = req.body;

        const user = await User.findById(req.user.id);

        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: "Perfil actualizado correctamente",
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cambiar contraseña
// @route   POST /api/auth/change-password
// @access  Privado
export const changePassword = async (req, res, next) => {
    try{
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona la contraseña actual y la nueva',
                statusCode: 400
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        
        // Verificar contraseña actual
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'La contraseña actual es incorrecta',
                statusCode: 401
            });
        }

        // Actualizar contraseña
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Contraseña cambiada correctamente',
        });
    } catch (error) {
        next(error);
    }
};
