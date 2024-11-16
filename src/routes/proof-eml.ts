import multer from 'multer';
import router from './index';
import { Request, Response } from 'express';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import {post} from "../utils/api";

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

const VLayerServerURL = 'http://localhost:3001';
const VerifyProof = post<{
  emlContent: string;
}, {
  message: string;
  proofResult: any;
  txHash: string;
}>(VLayerServerURL, '/generate-proof')

// Route to handle EML file upload
router.put('/proof-eml', upload.single('emlFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send('Please upload an EML file');
    }

    const emlFilePath = req.file.path;

    // Read the EML file and parse it using mailparser
    const emlContent = fs.createReadStream(emlFilePath);
    const emlStr = fs.readFileSync(emlFilePath, 'utf8');

    console.log('EML Str:', emlStr);

    simpleParser(emlContent, async (err, parsed) => {
      if (err) {
        return res.status(500).send('Error parsing the EML file');
      }

      // Log the parsed email information
      console.log('Email Subject:', parsed.subject);
      console.log('Sender:', parsed.from?.text);
      console.log('Recipients:', parsed.to?.text);
      console.log('Email Content:', parsed.text);

      const proof = await VerifyProof({ emlContent: emlStr })
      console.log('Proof:', proof)

      // Return the parsed content to the client
      res.json({
        subject: parsed.subject,
        from: parsed.from?.text,
        to: parsed.to?.text,
        text: parsed.text,
        proof,
      });

      // Delete the temporary uploaded file after processing
      fs.unlink(emlFilePath, (err) => {
        if (err) console.error('Error deleting the temporary file:', err);
      });
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});
