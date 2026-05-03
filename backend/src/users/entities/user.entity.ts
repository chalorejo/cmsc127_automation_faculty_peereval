import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  FACULTY = 'Faculty',
  DEP_CHAIR = 'DepChair',
  DEAN = 'Dean',
  ADMIN = 'Admin',
}

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FACULTY,
  })
  role: UserRole;

  @Column({ type: 'bytea', nullable: true })
  image: Buffer | null;
}