import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { UserEntity } from 'src/infrastructure/database/user.entity';

@Entity()
export class SavedPositionEntity {
  @PrimaryColumn('uuid', { name: 'book_id' })
  bookId: string;

  @PrimaryColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column()
  position: string;

  @Column({ name: 'device_name' })
  deviceName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BookEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book?: BookEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
