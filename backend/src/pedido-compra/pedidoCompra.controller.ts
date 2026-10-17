import { Request, Response } from 'express'; //agora tentando sem usar decorator pra treinar
import { PedidoCompraService } from './pedido-compra.service.ts';

export class PedidoCompraController {
  constructor(private readonly service: PedidoCompraService) {}

  private lerId(req: Request): number {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw { status: 400, message: 'id inválido' };
    }
    return id;
  }

  listar = async (req: Request, res: Response) => {
    try {
      const pedidos = await this.service.listar();
      return res.status(200).json(pedidos);
    } catch (erro: any) {
      res.status(erro.status).json({ message: erro.message });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const pedido = await this.service.buscarPorId(this.lerId(req));
      return res.status(200).json(pedido);
    } catch (erro: any) {
      res.status(erro.status).json({ message: erro.message });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const pedido = await this.service.criar(req.body);
      return res.status(201).json(pedido);
    } catch (erro: any) {
      res.status(erro.status).json({ message: erro.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const pedido = await this.service.atualizar(this.lerId(req), req.body);
      return res.status(200).json(pedido);
    } catch (erro: any) {
      res.status(erro.status).json({ message: erro.message });
    }
  };

  remover = async (req: Request, res: Response) => {
    try {
      await this.service.remover(this.lerId(req));
      return res.status(204).send();
    } catch (erro: any) {
      res.status(erro.status).json({ message: erro.message });
    }
  };
}
