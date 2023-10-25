const express = require('express');
const {
    handleCheckExistence,
    handleRegister,
    handleSignIn,
    handleSignOut,
    // handleChangeUsername, 
    // handleChangePassword,
    // handleDeleteAccount
} = require('../controllers/accountController');
const verifyPassword = require('../middleware/verifyPassword');
const router = express.Router();
router.get('/', handleCheckExistence);
router.post('/register', handleRegister);
router.post('/signin', handleSignIn);
router.post('/signout', handleSignOut);
// router.put('/username', [verifyPassword], handleChangeUsername);
// router.put('/password', [verifyPassword], handleChangePassword);
// router.delete('/', [verifyPassword], handleDeleteAccount);
module.exports = router;