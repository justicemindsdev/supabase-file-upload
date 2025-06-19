#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Supabase configuration
const supabaseConfig = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://tvecnfdqakrevzaeifpk.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIwNjQsImV4cCI6MjA2Mzk1ODA2NH0.q-8ukkJZ4FGSbZyEYp0letP-S58hC2PA6lUOWUH9H2Y',
  SUPABASE_BUCKET_NAME: 'sites',
  SUPABASE_REGION: 'eu-west-2',
  SUPABASE_STORAGE_URL: 'https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/s3'
};

// Create .env.local file for local development
function setupLocalEnv() {
  console.log('Setting up local environment variables...');
  
  const envContent = Object.entries(supabaseConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env.local', envContent);
  console.log('Created .env.local file with Supabase configuration');
}

// Set up Vercel environment variables
function setupVercelEnv() {
  console.log('Setting up Vercel environment variables...');
  
  try {
    // Check if Vercel CLI is installed
    execSync('which vercel', { stdio: 'ignore' });
    
    // Set each environment variable
    Object.entries(supabaseConfig).forEach(([key, value]) => {
      try {
        execSync(`vercel env add ${key} production`, { stdio: 'pipe' });
        // Note: This will prompt for the value interactively
        console.log(`Added ${key} to Vercel environment variables`);
      } catch (error) {
        console.error(`Failed to add ${key}: ${error.message}`);
      }
    });
    
    console.log('Vercel environment variables setup complete');
  } catch (error) {
    console.error('Vercel CLI not found. Please install it with: npm i -g vercel');
  }
}

// Set up custom domain
function setupCustomDomain() {
  console.log('Setting up custom domain...');
  
  try {
    execSync('vercel domains add utility.justice-minds.com', { stdio: 'inherit' });
    console.log('Custom domain setup initiated. Follow the verification steps if prompted.');
  } catch (error) {
    console.error(`Failed to set up custom domain: ${error.message}`);
  }
}

// Create Supabase bucket using CLI
function setupSupabaseBucket() {
  console.log('Setting up Supabase storage bucket...');
  
  try {
    // Check if Supabase CLI is installed
    execSync('which supabase', { stdio: 'ignore' });
    
    // Create the bucket
    execSync('supabase storage create sites --public', { stdio: 'inherit' });
    
    // Update bucket settings
    execSync('supabase storage update bucket sites --public=true', { stdio: 'inherit' });
    
    // Set CORS configuration
    execSync('supabase storage cors add "*" "GET,POST,PUT,DELETE,OPTIONS" "*" "86400"', { stdio: 'inherit' });
    
    console.log('Supabase storage bucket setup complete');
  } catch (error) {
    console.error('Supabase CLI not found or error occurred. Please install it with: npm install -g supabase');
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--local') || args.length === 0) {
    setupLocalEnv();
  }
  
  if (args.includes('--vercel')) {
    setupVercelEnv();
  }
  
  if (args.includes('--domain')) {
    setupCustomDomain();
  }
  
  if (args.includes('--bucket')) {
    setupSupabaseBucket();
  }
  
  if (args.includes('--all')) {
    setupLocalEnv();
    setupVercelEnv();
    setupCustomDomain();
    setupSupabaseBucket();
  }
  
  if (args.includes('--help')) {
    console.log(`
Usage: node setup-env.js [options]

Options:
  --local    Set up local environment variables (.env.local)
  --vercel   Set up Vercel environment variables
  --domain   Set up custom domain (utility.justice-minds.com)
  --bucket   Set up Supabase storage bucket
  --all      Run all setup steps
  --help     Show this help message
    `);
  }
}

main();
