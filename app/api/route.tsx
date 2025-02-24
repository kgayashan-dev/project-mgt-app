import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,// false
  },
};

// Set the directory where files will be saved
const uploadDir = path.join(process.cwd(), 'public/uploads');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir, // Save files directly to the upload directory
    keepExtensions: true, // Keep file extensions
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error uploading file' });
    }

    const file = files.file as formidable.File; // Access the uploaded file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Rename the uploaded file to include invoice number and date
    const invoiceNo = fields.invoiceNo as string;
    const invoiceDate = fields.invoiceDate as string;
    const newFileName = `${invoiceNo}_${invoiceDate}_${file.originalFilename}`;
    const newPath = path.join(uploadDir, newFileName);

    try {
      await fs.promises.rename(file.filepath, newPath); // Rename and move the file
      res.status(200).json({ message: 'File uploaded successfully', fileName: newFileName });
    } catch (error) {
      console.error('Error saving file:', error);
      res.status(500).json({ error: 'Error saving file' });
    }
  });
};

export default handler;
