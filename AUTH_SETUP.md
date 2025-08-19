# Authentication & Database Setup Guide

This guide will help you set up NextAuth.js authentication and Prisma ORM with PostgreSQL for the Exam Prep App.

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/examprep?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT
JWT_SECRET="your-jwt-secret-here-change-in-production"
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database named `examprep`
3. Update the `DATABASE_URL` in your `.env` file

#### Option B: Supabase (Recommended for development)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string and update `DATABASE_URL`

#### Option C: Neon (Serverless PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string and update `DATABASE_URL`

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env` file

### 4. Database Migration & Seeding

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Open Prisma Studio (optional)
npm run db:studio
```

## 🔐 Authentication Features

### Supported Providers
- **Email/Password**: Traditional login with bcrypt password hashing
- **Google OAuth**: Social login with Google accounts

### User Roles
- **STUDENT**: Default role for regular users
- **TEACHER**: Can create documents and questions
- **ADMIN**: Full access to all features

### Protected Routes
- `/dashboard/*` - All authenticated users
- `/teacher/*` - Teachers and Admins only
- `/admin/*` - Admins only

## 🗄️ Database Schema

### Core Tables

#### Users
- Basic user information (email, password, name, role)
- Role-based access control
- Email verification support

#### Documents
- Educational content storage
- Support for various file types
- Tagging and categorization

#### Questions
- Multiple question types (MCQ, True/False, etc.)
- Difficulty levels and point systems
- Explanations and correct answers

#### Attempts
- Track user quiz attempts
- Score calculation and timing
- Answer storage in JSON format

#### Subscriptions
- User subscription management
- Feature access control
- Billing integration ready

## 🛡️ Security Features

### Password Security
- bcrypt hashing with salt rounds
- Minimum 8 character requirement
- Secure password validation

### JWT Tokens
- Secure session management
- Configurable expiration
- Role-based claims

### Route Protection
- Middleware-based authentication
- Role-based access control
- Automatic redirects for unauthorized access

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (via NextAuth)
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Protected Routes
All dashboard routes are protected by default. Users must be authenticated to access:
- Dashboard pages
- Upload functionality
- Practice sessions
- Results and analytics
- Settings

## 🚨 Production Considerations

### Environment Variables
- Use strong, unique secrets for production
- Store sensitive data in environment variables
- Never commit `.env` files to version control

### Database Security
- Use connection pooling in production
- Implement proper database backups
- Consider using managed database services

### OAuth Configuration
- Update redirect URIs for production domain
- Use HTTPS in production
- Implement proper error handling

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify `DATABASE_URL` format
- Check database server status
- Ensure proper network access

#### Authentication Issues
- Verify Google OAuth credentials
- Check NextAuth configuration
- Ensure proper redirect URIs

#### Prisma Errors
- Run `npm run db:generate` after schema changes
- Check database schema compatibility
- Verify Prisma client version

### Debug Mode
Enable debug logging by adding to your `.env`:
```bash
DEBUG=prisma:*
NEXTAUTH_DEBUG=true
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs/)
- [Neon Documentation](https://neon.tech/docs/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for errors
3. Verify all environment variables are set correctly
4. Ensure database is running and accessible
5. Check NextAuth and Prisma documentation

---

**Note**: This setup provides a solid foundation for authentication and database management. For production deployments, consider additional security measures like rate limiting, input validation, and monitoring.
