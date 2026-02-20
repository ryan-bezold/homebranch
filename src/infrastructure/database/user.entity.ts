import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { RoleEntity } from 'src/infrastructure/database/role.entity';

@Entity()
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: false })
  isRestricted: boolean;

  @ManyToOne(() => RoleEntity, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;
}
