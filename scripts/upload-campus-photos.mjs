import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const envContent = readFileSync(join(projectRoot, '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match && !match[1].startsWith('#')) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const bucket = 'photos';
const section = 'Campus';

const files = [
  'WhatsApp Image 2026-04-23 at 1.22.50 AM.jpeg',
  'WhatsApp Image 2026-04-23 at 1.22.51 AM.jpeg',
  'WhatsApp Image 2026-04-23 at 1.22.53 AM.jpeg',
  'WhatsApp Image 2026-04-23 at 1.22.54 AM.jpeg',
];

const uploadDir = join(projectRoot, 'upload');

for (let i = 0; i < files.length; i++) {
  const fileName = files[i];
  const filePath = join(uploadDir, fileName);
  try {
    const buffer = readFileSync(filePath);
    const randomStr = Math.random().toString(36).slice(2, 8);
    const storagePath = `campus-${i + 1}-${randomStr}.jpg`;

    console.log(`[${i + 1}/${files.length}] Uploading: ${fileName}`);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) {
      console.error(`  Upload error: ${uploadError.message}`);
      continue;
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;

    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        section: section,
        caption: `Impact Computers - Campus`,
        image_url: imageUrl,
        sort_order: i,
        is_active: true,
      });

    if (dbError) {
      console.error(`  DB error: ${dbError.message}`);
    } else {
      console.log(`  Success`);
    }
  } catch (err) {
    console.error(`  Error: ${err.message}`);
  }
}

console.log('\nDone!');
