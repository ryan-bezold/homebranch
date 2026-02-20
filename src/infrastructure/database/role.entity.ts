import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/infrastructure/database/user.entity';

@Entity()
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('simple-array')
  permissions: string[];

  @OneToMany(() => UserEntity, (user) => user.role)
  users?: UserEntity[];
}
