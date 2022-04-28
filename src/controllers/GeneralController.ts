import { Request, Response } from 'express';

class GeneralController {
  public async start(req: Request, res: Response): Promise<Response> {
    return res.sendStatus(200);
  }
}

export default GeneralController;
