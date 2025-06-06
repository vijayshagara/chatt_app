import { Column, Model, Default, Table, CreatedAt, UpdatedAt, DataType, ForeignKey } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

@Table({ tableName: 'conversations', timestamps: true })
export class Conversations extends Model {
  @Default(UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  public id!: string;

  @Column({ type: DataType.ENUM('private', 'group'), allowNull: false, defaultValue: 'private' })
  public type!: 'private' | 'group';

  @Column({ type: DataType.STRING, allowNull: true })
  public name!: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'createdAt' })
  public createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updatedAt' })
  public updatedAt!: Date;
}

export default Conversations;
