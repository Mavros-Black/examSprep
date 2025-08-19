#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Exam Prep App Setup');
console.log('=======================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/examprep?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT
JWT_SECRET="your-jwt-secret-here-change-in-production"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the values in .env file before continuing.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if database is configured
console.log('🔍 Checking database configuration...');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('username:password') || envContent.includes('your-secret-key-here')) {
    console.log('⚠️  Please update your .env file with proper values before continuing.');
    console.log('   - Set DATABASE_URL to your PostgreSQL connection string');
    console.log('   - Generate a secure NEXTAUTH_SECRET');
    console.log('   - Add your Google OAuth credentials');
    console.log('   - Set a secure JWT_SECRET\n');
  } else {
    console.log('✅ Environment variables appear to be configured.\n');
  }
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}

console.log('📚 Next Steps:');
console.log('1. Update your .env file with proper values');
console.log('2. Set up your PostgreSQL database (or use Supabase/Neon)');
console.log('3. Configure Google OAuth in Google Cloud Console');
console.log('4. Run: npm run db:push (or npm run db:migrate)');
console.log('5. Run: npm run db:seed');
console.log('6. Start the app: npm run dev\n');

console.log('📖 For detailed instructions, see AUTH_SETUP.md');
console.log('🔗 Useful resources:');
console.log('   - Supabase: https://supabase.com');
console.log('   - Neon: https://neon.tech');
console.log('   - Google Cloud Console: https://console.cloud.google.com\n');

console.log('🎉 Setup complete! Happy coding!');
