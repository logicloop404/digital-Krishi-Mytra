import 'dotenv/config';
import { connectDatabase } from '../config/db.js';
import GovernmentScheme from '../models/GovernmentScheme.js';

const schemes = [
  { title: 'PM-KISAN Samman Nidhi', category: 'Income Support', benefit: '₹6,000 per year', description: 'Direct income support for eligible landholding farmer families.', eligibility: ['Landholding farmer family', 'Valid Aadhaar'], tags: ['Landholding farmer', 'Aadhaar required'] },
  { title: 'Pradhan Mantri Fasal Bima Yojana', category: 'Crop Insurance', benefit: 'Low premium insurance', description: 'Financial protection against crop loss from weather, pests and disease.', eligibility: ['All farmers', 'Seasonal enrolment'], tags: ['All farmers', 'Seasonal enrolment'] },
  { title: 'Soil Health Card Scheme', category: 'Soil Health', benefit: 'Free soil analysis', description: 'Get nutrient status and fertilizer recommendations for your farmland.', eligibility: ['All farmers'], tags: ['All farmers', 'Apply at KVK'] },
];
await connectDatabase();
await GovernmentScheme.bulkWrite(schemes.map((scheme) => ({ updateOne: { filter: { title: scheme.title }, update: { $set: scheme }, upsert: true } })));
console.log('Government schemes seeded');
process.exit(0);
