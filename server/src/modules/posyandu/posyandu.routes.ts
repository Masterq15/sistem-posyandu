import { Router } from 'express';
import {
  getAllPosyandu,
  getPosyanduById,
  createPosyandu,
  updatePosyandu,
  deletePosyandu,
} from './posyandu.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createPosyanduSchema, updatePosyanduSchema } from './posyandu.schema';
import kaderRoutes from '../kader/kader.routes';
import riwayatRoutes from '../riwayat/riwayat.routes';

const router = Router();

// Sub-module routes for Posyandu tenant
router.use('/:posyanduId/kader', kaderRoutes);
router.use('/:posyanduId', riwayatRoutes);

// Posyandu CRUD
router.get('/', authenticate, getAllPosyandu);
router.get('/:id', authenticate, getPosyanduById);
router.post('/', authenticate, authorize('OWNER'), validate(createPosyanduSchema), createPosyandu);
router.put('/:id', authenticate, authorize('OWNER'), validate(updatePosyanduSchema), updatePosyandu);
router.patch('/:id', authenticate, authorize('OWNER'), validate(updatePosyanduSchema), updatePosyandu);
router.delete('/:id', authenticate, authorize('OWNER'), deletePosyandu);

export default router;
