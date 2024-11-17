import multer from 'multer';
import router from './index';
import { Request, Response } from 'express';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import {getContract} from "../core/contract";

// Route to handle EML file upload
router.put('/estimate-time', async (req: Request, res: Response) => {
  try {
    let {tripId, startPos, endPos, estEndTime} = req.body;
    // const {latitude: startLat, longitude: startLon} = startPos;
    // const {latitude: endLat, longitude: endLon} = endPos;

    estEndTime = Math.floor(estEndTime / 1000);

    // TODO: Do some validation, calculate the estimated time
    const platform = await getContract("BOTPlatform");
    const tx = await platform.estimateTrip(tripId, estEndTime);

    console.log('estimateTrip:', tx);

    res.json({ tx });
  } catch (error) {
    console.error('Error registering email:', error);
    res.status(500).send('Server error');
  }
});
