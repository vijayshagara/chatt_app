import { HttpException } from "../exceptions/HttpException";
import ConversationParticipants from "../models/conversationParticipants.model";
import Conversations from "../models/conversations.model";
import Messages from "../models/messages.model";
import { isEmpty } from "../utils/type&emptyValidte";

class MessageService {
    public async createMessage(messageData: any): Promise<any> {
        if (isEmpty(messageData)) throw new HttpException(400, 'Message data is empty');
        try {
            const converstation = await Conversations.create(messageData);
            if (!converstation) throw new HttpException(400, 'Failed to create conversation');
            const conversationParticipant = await ConversationParticipants.create({
                conversationId: converstation.id,
                userId: messageData.userId,
                isSender: messageData.isSender,
                isReceiver: messageData.isReceiver,
            });
            if (!conversationParticipant) throw new HttpException(400, 'Failed to create conversation participant');
            const message = {
                conversationId: converstation.id,   
                senderId: messageData.senderId,
            };
            const newMessage = await Messages.create(message);
            return newMessage;
        } catch (error: any) {
            throw new HttpException(500, error?.response?.data?.errorMessage || 'Failed to create message');
           
        }
    }

    public async getMessages(): Promise<any> {
        // Simulate fetching messages from a database
        return [
        { id: 1, text: 'Hello World' },
        { id: 2, text: 'Hello Koa' },
        ];
    }
    
    public async updateMessage(id: number, messageData: any): Promise<any> {
        // Simulate updating a message in a database
        return { id, ...messageData };
    }
    
    public async deleteMessage(id: number): Promise<void> {
        // Simulate deleting a message from a database
        return;
    }
   
}

export default MessageService;

