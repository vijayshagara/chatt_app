// models/UserEntity.ts
import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AllowNull,
  } from 'sequelize-typescript';
  
  @Table({ tableName: 'user_entity', timestamps: false })
  export class UserEntity extends Model<UserEntity> {
    @PrimaryKey
    @AllowNull(false)
    @Column({ type: DataType.STRING })
    public id!: string;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public email?: string;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public email_constraint?: string;
  
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    public email_verified!: boolean;
  
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    public enabled!: boolean;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public federation_link?: string;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public first_name?: string;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public last_name?: string;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public realm_id?: string;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public username?: string;
  
    @AllowNull(true)
    @Column({ type: DataType.BIGINT })
    public created_timestamp?: number;
  
    @AllowNull(true)
    @Column({ type: DataType.STRING })
    public service_account_client_link?: string;
  
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    public not_before!: number;
  }
  
  export default UserEntity;
  