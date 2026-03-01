import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Por favor proporciona un nombre de usuario'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Por favor proporciona un correo electrónico'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor proporciona un correo válido']
    },
    password: {
        type: String,
        required: [true, 'Por favor proporciona una contraseña'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;