import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '@tm/data';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'text' })
  role!: Role;

  @Column({ type: 'uuid' })
  organizationId!: string;
}
