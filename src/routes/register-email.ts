import multer from 'multer';
import router from './index';
import { Request, Response } from 'express';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import {getContract} from "../core/contract";

// Route to handle EML file upload
router.put('/register-email', async (req: Request, res: Response) => {
  try {
    const {address, email} = req.body;

    // TODO: Do some validation
    const platform = await getContract("BOTPlatform");
    const tx = await platform.registerEmail(address, email);

    console.log('Email registered:', tx);

    res.json({ tx });
  } catch (error) {
    console.error('Error registering email:', error);
    res.status(500).send('Server error');
  }
});
