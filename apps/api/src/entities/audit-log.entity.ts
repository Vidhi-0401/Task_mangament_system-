import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  ts!: Date;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgId!: string | null;

  @Column()
  action!: string;

  @Column()
  method!: string;

  @Column()
  path!: string;

  @Column({ nullable: true })
  resourceId!: string | null;

  @Column({ type: 'text' })
  outcome!: 'ALLOWED' | 'DENIED';

  @Column({ type: 'int' })
  statusCode!: number;

  @Column({ nullable: true })
  ip!: string | null;
}
