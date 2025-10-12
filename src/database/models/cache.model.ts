import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'cache',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Cache extends Model<Cache> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  key: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  data: any;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expires_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;
}
