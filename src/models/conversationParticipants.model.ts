import {
  Table,
  Model,
  Column,
  DataType,
  Default,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import Conversations from './conversations.model'; // adjust the path as needed
import User from './users.model'; // assuming you have a User model mapped to 'user_entity' table

@Table({ tableName: 'conversation_participants' })
export class ConversationParticipants extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column({ type: DataType.UUID })
  public id!: string;

  @ForeignKey(() => Conversations)
  @Column({ type: DataType.UUID, allowNull: false, field: 'conversationId' })
  public conversationId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false, field: 'userId' })
  public userId!: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'createdAt' })
  public createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updatedAt' })
  public updatedAt!: Date;
}

export default ConversationParticipants;
