import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('colleges')
export class College {
	@PrimaryGeneratedColumn()
	college_id: number;

	@Column({ type: 'varchar', length: 255, unique: true })
	name: string;

	@OneToMany(() => User, (user) => user.college)
	users: User[];
}
