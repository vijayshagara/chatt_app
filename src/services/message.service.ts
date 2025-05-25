import { HttpException } from "../exceptions/HttpException";
import Messages from "../models/messages.model";
import { isEmpty } from "../utils/type&emptyValidte";
import DB from "../database";
import searchFilter from "../utils/searchFilter";
import Session from "../utils/session";

class MessageService {
    public async createMessage(messageData: any): Promise<any> {
        if (isEmpty(messageData)) throw new HttpException(400, 'Message data is empty');
        try {
            const converstation = await DB.Conversations.create(messageData);
            if (!converstation) throw new HttpException(400, 'Failed to create conversation');
            const conversationParticipant = await DB.ConversationParticipants.create({
                conversationId: converstation.id,
                userId: Session.getSessionValue('userId'),
            },);
            if (!conversationParticipant) throw new HttpException(400, 'Failed to create conversation participant');
            const message = {
                conversationId: converstation.id,
                content: messageData.content,
                senderId: Session.getSessionValue('userId'),
            };
            const newMessage = await Messages.create(message);
            return newMessage;
        } catch (error: any) {
            throw new HttpException(500, error?.response?.data?.errorMessage || 'Failed to create message');
        }
    }

    public async getMessages(query: any): Promise<any> {
        const message = await searchFilter({
            model: DB.Conversations,
            filters: query,
        })
        return message
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

