import { Router } from 'express';
import ussdController from '../src/controllers/ussdController';

const router = new Router();

router.route('/request').post(new ussdController().ussdRequest);

module.exports = router;
