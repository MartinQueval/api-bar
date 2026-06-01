import { Router } from 'express';
import {
  createBar,
  listBars,
  getBar,
  updateBar,
  deleteBar,
} from '../controllers/barController';

const router = Router();

router.post('/', createBar);
router.get('/', listBars);
router.get('/:id', getBar);
router.put('/:id', updateBar);
router.delete('/:id', deleteBar);

export default router;
