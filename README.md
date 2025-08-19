# ExamPrep - AI-Powered Exam Preparation Platform

A comprehensive exam preparation platform built with Next.js 14, featuring AI-powered question generation, OCR document processing, and intelligent study tools.

## 🚀 Features

- **AI-Powered Question Generation**: Uses DeepSeek AI to generate exam-style questions from uploaded documents
- **Document Processing**: OCR support for PDFs and images with intelligent text extraction
- **Smart Study Tools**: Topic-based question organization and practice sessions
- **Authentication**: Secure user authentication with NextAuth.js
- **Database**: PostgreSQL with Prisma ORM for robust data management
- **File Storage**: Supabase Storage for secure document management
- **Modern UI**: Beautiful, responsive interface built with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js
- **AI**: DeepSeek AI API
- **File Processing**: Tesseract.js (OCR), pdf-parse
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase recommended)
- DeepSeek AI API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/examprep.git
cd examprep
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Supabase
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# DeepSeek AI
DEEPSEEK_API_KEY="your_deepseek_api_key"
DEEPSEEK_BASE_URL="https://api.deepseek.com"

# S3 Storage (Supabase)
S3_ACCESS_KEY="your_s3_access_key"
S3_SECRET_KEY="your_s3_secret_key"
S3_REGION="your_s3_region"
S3_BUCKET="documents"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/examprep.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

### Environment Variables for Production

Set these in your Vercel project settings:

- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: A secure random string
- `DATABASE_URL`: Your production PostgreSQL URL
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `DEEPSEEK_API_KEY`: Your DeepSeek AI API key
- `DEEPSEEK_BASE_URL`: DeepSeek API base URL
- `S3_ACCESS_KEY`: Your S3 access key
- `S3_SECRET_KEY`: Your S3 secret key
- `S3_REGION`: Your S3 region
- `S3_BUCKET`: Your S3 bucket name

## 📁 Project Structure

```
examprep/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── practice/          # Practice interface
│   ├── upload/            # File upload interface
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── ocr-processor.ts  # OCR processing logic
│   └── deepseek-service.ts # AI service integration
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/examprep/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for seamless deployment
- Supabase for database and storage solutions
- DeepSeek for AI capabilities
- The open-source community for various libraries and tools

---

**Made with ❤️ for students and educators**
