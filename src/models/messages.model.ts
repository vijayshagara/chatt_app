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
  import Conversations from './conversations.model'; // Adjust path as needed
  import User from './users.model'; // Assuming this represents 'user_entity' table
  
  @Table({ tableName: 'messages' })
  export class Messages extends Model {
    @PrimaryKey
    @Default(UUIDV4)
    @Column({ type: DataType.UUID })
    public id!: string;
  
    @ForeignKey(() => Conversations)
    @Column({ type: DataType.UUID, allowNull: false })
    public conversationId!: string;
  
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING, allowNull: false })
    public senderId!: string;
  
    @Column({ type: DataType.TEXT, allowNull: false })
    public content!: string;
  
    @Default('text')
    @Column({
      type: DataType.ENUM('text', 'image', 'file'),
      allowNull: false,
    })
    public messageType!: 'text' | 'image' | 'file';
  
    @CreatedAt
    @Column({ type: DataType.DATE })
    public createdAt!: Date;
  
    @UpdatedAt
    @Column({ type: DataType.DATE })
    public updatedAt!: Date;
  }
  
  export default Messages;
  