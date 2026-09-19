import { Request, Response, NextFunction } from 'express';
import { posyanduService } from './posyandu.service';

export const getAllPosyandu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await posyanduService.findAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getPosyanduById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = await posyanduService.findById(id);
    if (!data) {
      res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan' });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createPosyandu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await posyanduService.create(req.body);
    res.status(201).json({ success: true, message: 'Posyandu berhasil dibuat', data });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const updatePosyandu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = await posyanduService.update(id, req.body);
    res.json({ success: true, message: 'Posyandu berhasil diperbarui', data });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const deletePosyandu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await posyanduService.delete(id);
    res.json({ success: true, message: 'Posyandu berhasil dihapus' });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};
