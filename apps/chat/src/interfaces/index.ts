export interface Message extends Document {
    readonly message: string;
    readonly from: number;
    readonly date: Date;
}

export interface Conversation extends Document {
    readonly lastMessage: Message;
    readonly participants: number[];
}