# File Upload & OCR Processing Features

## Overview

This application includes a comprehensive file upload system with OCR (Optical Character Recognition) processing, document management, and intelligent text chunking. The system supports PDFs and images, processes them with advanced OCR technology, and stores the results in a structured database.

## Features Implemented

### 1. File Upload System
- **Drag & Drop Interface**: Modern drag-and-drop upload zone with visual feedback
- **File Validation**: Supports PDF, JPEG, PNG files up to 10MB
- **Progress Tracking**: Real-time upload progress with status indicators
- **Multiple File Upload**: Upload multiple files simultaneously
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 2. OCR Processing Pipeline
- **PDF Text Extraction**: Extracts text from PDFs with embedded text
- **Image OCR**: Uses Tesseract.js for high-quality OCR on images
- **Processing Status**: Real-time status updates (Pending → Processing → Completed/Failed)
- **Background Processing**: Non-blocking OCR processing with progress indicators

### 3. Document Management
- **Document Viewer**: Rich document viewer with sectioned content
- **Metadata Display**: Shows file information, processing status, and tags
- **Search & Filter**: Advanced search and filtering by status, subject, and tags
- **Document List**: Grid view of all uploaded documents with status indicators

### 4. Text Processing & Chunking
- **Intelligent Sectioning**: Automatically detects and separates:
  - Headings (based on formatting and capitalization)
  - Paragraphs (regular text content)
  - Lists (bullet points and numbered lists)
  - Tables (structured data)
- **Metadata Extraction**: Stores confidence scores and processing metadata
- **Content Organization**: Orders sections logically for better readability

### 5. Storage Integration
- **Supabase Storage**: Cloud storage for uploaded files
- **Database Storage**: Structured storage of processed content and metadata
- **Public URLs**: Direct access to uploaded files
- **File Management**: Automatic file naming and organization

## Technical Architecture

### Frontend Components
- `UploadDropzone.tsx`: Main upload interface with drag-and-drop
- `DocumentViewer.tsx`: Rich document viewer with sections
- `DocumentsPage.tsx`: Document management and listing
- `UploadPage.tsx`: Upload page with features overview

### Backend API Endpoints
- `POST /api/upload`: File upload and processing
- `GET /api/documents`: List all documents with filtering
- `GET /api/documents/status/[id]`: Get specific document with sections

### Database Schema
```prisma
model Document {
  id                String            @id @default(cuid())
  title             String
  description       String?
  content           String
  fileUrl           String?
  fileType          String?
  fileSize          Int?
  subject           String
  tags              String[]
  isPublic          Boolean           @default(false)
  processingStatus  ProcessingStatus  @default(PENDING)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  creatorId         String
  creator           User              @relation("DocumentCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  sections          DocumentSection[]
  questions         Question[]
  attempts          Attempt[]
}

model DocumentSection {
  id          String       @id @default(cuid())
  documentId  String
  document    Document     @relation(fields: [documentId], references: [id], onDelete: Cascade)
  type        SectionType
  content     String
  order       Int
  metadata    Json?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum SectionType {
  HEADING
  PARAGRAPH
  LIST
  TABLE
  IMAGE
  EQUATION
}
```

### Dependencies
```json
{
  "@supabase/supabase-js": "^2.x.x",
  "tesseract.js": "^4.x.x",
  "pdfjs-dist": "^3.x.x",
  "sharp": "^0.32.x",
  "react-dropzone": "^14.x.x"
}
```

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file with the following variables:
```bash
# Database
DATABASE_URL="postgresql://postgres:your-password@your-supabase-host:5432/postgres?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Supabase Setup
1. Create a new Supabase project
2. Enable Storage and create a `documents` bucket
3. Set bucket permissions to allow authenticated uploads
4. Copy your project URL and API keys to `.env`

### 3. Database Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (optional)
npm run db:seed
```

### 4. Storage Bucket Configuration
In your Supabase dashboard:
1. Go to Storage → Buckets
2. Create a new bucket called `documents`
3. Set the following policies:

**For authenticated users to upload:**
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**For authenticated users to read:**
```sql
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');
```

## Usage Guide

### Uploading Documents
1. Navigate to `/upload`
2. Drag and drop files or click to browse
3. Files are automatically processed with OCR
4. Monitor progress in real-time
5. View processed documents in `/documents`

### Viewing Documents
1. Go to `/documents` to see all uploaded files
2. Use search and filters to find specific documents
3. Click on any document to view its processed content
4. Toggle metadata panel to see file information
5. Download original files using the download button

### Document Processing
- **PDFs**: Text extraction from embedded text or OCR for scanned documents
- **Images**: OCR processing with Tesseract.js
- **Processing Time**: Varies by file size and complexity
- **Status Updates**: Real-time status tracking throughout the process

## Advanced Features

### Text Chunking Algorithm
The system uses intelligent algorithms to:
- Detect document structure (headings, paragraphs, lists)
- Preserve logical flow and hierarchy
- Extract metadata and confidence scores
- Organize content for optimal readability

### Error Handling
- File validation (type, size, format)
- Network error recovery
- Processing failure detection
- User-friendly error messages
- Retry mechanisms for failed uploads

### Performance Optimizations
- Client-side file validation
- Progressive upload with progress tracking
- Background processing to prevent UI blocking
- Efficient database queries with proper indexing
- Image optimization with Sharp

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `DATABASE_URL` in `.env`
   - Ensure Supabase is running and accessible
   - Verify SSL settings for Supabase connections

2. **Upload Fails**
   - Check file size (max 10MB)
   - Verify file type (PDF, JPEG, PNG only)
   - Ensure Supabase Storage is configured correctly

3. **OCR Processing Slow**
   - Large images may take longer to process
   - Check image quality and resolution
   - Consider image optimization before upload

4. **Storage Permissions**
   - Verify Supabase Storage bucket policies
   - Check authentication is working
   - Ensure service role key has proper permissions

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=prisma:*
```

## Future Enhancements

### Planned Features
- **Batch Processing**: Process multiple files simultaneously
- **Advanced OCR**: Support for more languages and document types
- **AI-Powered Tagging**: Automatic content tagging and categorization
- **Version Control**: Document versioning and change tracking
- **Collaboration**: Shared documents and team features
- **Export Options**: Export processed content in various formats

### Performance Improvements
- **Caching**: Implement Redis caching for frequently accessed documents
- **CDN Integration**: Use CDN for faster file delivery
- **Background Jobs**: Queue-based processing for large files
- **Compression**: Automatic file compression and optimization

## Security Considerations

### File Upload Security
- File type validation
- Size limits enforcement
- Malware scanning (future enhancement)
- Secure file storage with access controls

### Data Privacy
- User authentication required for uploads
- Private documents by default
- Optional public sharing with explicit consent
- GDPR compliance considerations

### Access Control
- Role-based access control (Student, Teacher, Admin)
- Document ownership verification
- Secure API endpoints with authentication
- Audit logging for file access

## API Documentation

### Upload Endpoint
```http
POST /api/upload
Content-Type: multipart/form-data

Parameters:
- file: File (required)
- title: string (optional)
- subject: string (optional)
- tags: string (optional, comma-separated)

Response:
{
  "success": true,
  "document": {
    "id": "string",
    "title": "string",
    "fileUrl": "string",
    "processingStatus": "COMPLETED"
  }
}
```

### Documents List Endpoint
```http
GET /api/documents?status=COMPLETED&subject=Math&search=calculus

Response:
{
  "documents": [
    {
      "id": "string",
      "title": "string",
      "processingStatus": "COMPLETED",
      "sectionCount": 10,
      "questionCount": 5
    }
  ]
}
```

### Document Status Endpoint
```http
GET /api/documents/status/{id}

Response:
{
  "document": {
    "id": "string",
    "title": "string",
    "sections": [
      {
        "id": "string",
        "type": "HEADING",
        "content": "string",
        "order": 0
      }
    ]
  }
}
```

This comprehensive upload system provides a robust foundation for document processing and management, with room for future enhancements and scalability.
