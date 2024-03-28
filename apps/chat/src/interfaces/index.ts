export interface Message extends Document {
    readonly message: string;
    readonly sendId: number;
    readonly date: Date;
    readonly conversationId: string
}

export interface Conversation extends Document {
    readonly lastMessage: Message;
    readonly participants: Participant[];
}

export interface Participant {
    name: String,
    id: Number
}