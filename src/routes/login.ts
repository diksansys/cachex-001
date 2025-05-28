import express from 'express';
import authController from '../controllers/authController';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.post('/login', asyncHandler(authController.handleLogin))
router.post('/logout', asyncHandler(authController.handleLogout))
router.post('/refresh', asyncHandler(authController.handleRefreshTokenRequest))

export default router