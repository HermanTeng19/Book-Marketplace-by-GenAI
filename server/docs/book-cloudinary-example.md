# Book Upload with Cloudinary - Postman Example

This document shows how to create a book in the Book Marketplace with Cloudinary file uploads using Postman.

## Setting Up Cloudinary

1. Sign up for a Cloudinary account at [cloudinary.com](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the Cloudinary Dashboard
3. Update your `.env` file with these values:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Postman Request for Creating a Book

### 1. Login to get a token

First, you need to authenticate to get a JWT token:

```
POST http://localhost:8000/api/auth/login
```

Request Body (JSON):
```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Copy the token from the response.

### 2. Create a Book with File Uploads

Set up a new request in Postman:

```
POST http://localhost:8000/api/books
```

Headers:
- Authorization: Bearer YOUR_JWT_TOKEN

Body:
- Select "form-data"
- Add the following key-value pairs:

| Key | Value | Type |
|-----|-------|------|
| title | Clean Code | Text |
| author | Robert C. Martin | Text |
| description | A handbook of agile software craftsmanship that revolutionizes the way programmers think about code quality. | Text |
| price | 29.99 | Text |
| category | Programming | Text |
| tags | ["programming", "software development", "best practices"] | Text |
| coverImage | [select image file] | File |
| pdfFile | [select PDF file] | File |

Important notes:
1. For `coverImage`, select an image file (jpg, png, etc.)
2. For `pdfFile`, select a PDF document
3. Make sure your token is valid and not expired
4. The file uploads might take some time depending on file size and internet connection

### Expected Response

```json
{
  "success": true,
  "data": {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "description": "A handbook of agile software craftsmanship that revolutionizes the way programmers think about code quality.",
    "price": 29.99,
    "coverImage": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/book-marketplace/covers/abcdef123456.jpg",
    "coverImagePublicId": "book-marketplace/covers/abcdef123456",
    "pdfFile": "https://res.cloudinary.com/your-cloud-name/raw/upload/v1234567890/book-marketplace/pdfs/ghijkl789012.pdf",
    "pdfFilePublicId": "book-marketplace/pdfs/ghijkl789012",
    "category": "Programming",
    "tags": ["programming", "software development", "best practices"],
    "seller": "60d21b4667d0d8992e610c85",
    "status": "available",
    "_id": "60d21b4667d0d8992e610c85",
    "reviews": [],
    "averageRating": 0,
    "createdAt": "2023-06-22T15:30:45.123Z",
    "updatedAt": "2023-06-22T15:30:45.123Z",
    "__v": 0
  }
}
```

## Troubleshooting

1. **"Unexpected field" error**: Make sure your field names match exactly (`coverImage` and `pdfFile`)
2. **Authorization errors**: Check that your JWT token is valid and not expired
3. **File upload errors**: 
   - Check file size (should be under 10MB)
   - For `coverImage`, only image files are accepted
   - For `pdfFile`, only PDF files are accepted
4. **Cloudinary configuration errors**: Verify your Cloudinary credentials in the `.env` file

## Testing the Upload

After successful upload, you can:
1. Check your Cloudinary dashboard to see the uploaded files
2. Use the GET `/api/books` endpoint to see your new book
3. Try accessing the Cloudinary URLs in your browser to verify the files 