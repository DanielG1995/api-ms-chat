import mongoose from 'mongoose';

// Definición del esquema para los mensajes
export const Message = new mongoose.Schema({
    _id: {
        type: String, // Definir el campo _id como String
        default: () => new mongoose.Types.ObjectId().toString() // Generar un ID único como string
    },
    senderId: {
        type: Number
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

// Definición del esquema para las conversaciones
export const Conversation = new mongoose.Schema({
    _id: {
        type: String, // Definir el campo _id como String
        default: () => new mongoose.Types.ObjectId().toString() // Generar un ID único como string
    },
    participants: [{
        type: Number,

    }],
    lastMessage: Message // Referencia al esquema de mensajes para almacenar los mensajes de la conversación
}, {
    versionKey: false // Esto evitará que se incluya el campo __v en las consultas
});


