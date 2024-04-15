const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

  res.send('Server is running - router');
  console.log('Server is running');
});

module.exports = router;