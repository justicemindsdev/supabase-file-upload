// Import required modules
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { randomUUID } from 'https://deno.land/std@0.177.0/node/crypto.ts';

// Supabase configuration
const SUPABASE_URL = 'https://tvecnfdqakrevzaeifpk.supabase.co';
const SUPABASE_ANON_KEY = 'b82c51dffe821aacbe5f9b190ce267d66ecc709bf03dde0add0315f846c92026';
const BUCKET_NAME = 'sites';

// File type mapping for folder organization
const fileTypeMap = {
  // Documents
  'pdf': 'documents',
  'doc': 'documents',
  'docx': 'documents',
  'txt': 'documents',
  'rtf': 'documents',
  
  // Spreadsheets
  'csv': 'spreadsheets',
  'xls': 'spreadsheets',
  'xlsx': 'spreadsheets',
  
  // Web
  'html': 'web',
  'htm': 'web',
  'css': 'web',
  'js': 'web',
  'jsx': 'web',
  'tsx': 'web',
  
  // Images
  'jpg': 'images',
  'jpeg': 'images',
  'png': 'images',
  'gif': 'images',
  'svg': 'images',
  'webp': 'images',
  
  // Audio
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  'm4a': 'audio',
  
  // Video
  'mp4': 'video',
  'mov': 'video',
  'avi': 'video',
  'webm': 'video',
  
  // Code
  'json': 'code',
  'xml': 'code',
  'py': 'code',
  'java': 'code',
  'c': 'code',
  'cpp': 'code',
  'cs': 'code',
  'php': 'code',
  'rb': 'code',
  'go': 'code',
  'rs': 'code',
  'ts': 'code',
  
  // Version control
  'git': 'version-control',
  'gitignore': 'version-control',
  
  // Archives
  'zip': 'archives',
  'rar': 'archives',
  'tar': 'archives',
  'gz': 'archives',
  '7z': 'archives',
};

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle CORS preflight requests
function handleCors(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
}

// Serve HTTP requests
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine the appropriate folder based on file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const folder = fileTypeMap[fileExtension] || 'other';
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { contentType: file.type });

    if (error) {
      console.error('Upload error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return success response
    return new Response(JSON.stringify({ 
      data,
      message: 'File uploaded successfully',
      folder: folder,
      path: filePath,
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}, { port: 8000 });

console.log('File upload server running on http://localhost:8000');
