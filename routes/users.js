import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('User information OK');
});

module.exports = router;
