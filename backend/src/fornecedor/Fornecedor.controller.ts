import { nomefuncaodoservicefornecedor } from 'caminhodoservicefornecedor'

export function GetFornecedorPeloId(req: Request, res: Response){
  try{
  const id: Number = Number(req.params.id);
  const fornecedor = nomefuncaodoservicefornecedor(id);
  if(!fornecedor){ throw { status: 404, message: "Fornecedor não encontrado!" }}
  return res.status(200).json(fornecedor);
    
    } catch(e){
        return res.status(e.status).json({erro: e.message});  
      }
}
