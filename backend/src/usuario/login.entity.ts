import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

export type Perfil = 'ADMIN' | 'CLIENTE' | 'FUNCIONARIO';

@Entity('login')
export class Login {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  email: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column({ type: 'varchar' })
  perfil: Perfil;
}
