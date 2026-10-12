import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'varchar', nullable: true })
  cpf: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
