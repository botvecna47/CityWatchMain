# AI-Assisted Duplicate Report Detection

This feature prevents duplicate reports by comparing incoming report content against recent nearby reports using AI embeddings or rule-based similarity matching.

## Features

- **AI-Powered Detection**: Uses embeddings to detect semantically similar reports
- **Fallback System**: Rule-based matching when AI models are unavailable
- **Geographic Filtering**: Only compares reports within a configurable radius
- **Time-Based Filtering**: Only considers recent reports (default: 24 hours)
- **User Override**: Users can still submit reports even if duplicates are detected
- **Configurable Thresholds**: Adjustable similarity thresholds and search parameters

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable/disable duplicate detection
DUPLICATE_CHECK_ENABLED=true

# Geographic search radius in meters (default: 100m)
DUPLICATE_GEO_RADIUS_METERS=100

# Time window in minutes (default: 1440 = 24 hours)
DUPLICATE_TIME_WINDOW_MINUTES=1440

# Embedding similarity threshold (default: 0.78)
DUPLICATE_EMBEDDING_THRESHOLD=0.78

# AI Model Configuration (choose one)
# Option 1: Local Ollama (recommended for privacy)
OLLAMA_URL=http://localhost:11434

# Option 2: OpenAI (requires API key)
# OPENAI_API_KEY=your-openai-api-key-here
```

### Model Options

#### 1. Ollama (Recommended)
- **Privacy**: All processing happens locally
- **Cost**: Free after initial setup
- **Setup**: Install Ollama and run `ollama pull nomic-embed-text`

#### 2. OpenAI
- **Privacy**: Data sent to OpenAI servers
- **Cost**: Pay-per-use (very low cost for embeddings)
- **Setup**: Get API key from OpenAI

#### 3. Rule-Based Fallback
- **Privacy**: No external services
- **Cost**: Free
- **Accuracy**: Lower than AI-based detection
- **Setup**: No setup required

## Database Migration

Run the migration to add the ReportEmbedding table:

```bash
npx prisma migrate dev --name add_report_embedding
```

**⚠️ Important**: Backup your database before running migrations in production!

## How It Works

### 1. Report Submission Flow

1. User submits a report
2. System checks for duplicates using configured method
3. If duplicates found:
   - Show modal with similar reports
   - User can view existing reports or submit anyway
4. If no duplicates or user overrides:
   - Report is created
   - Embedding is generated and stored (if AI available)

### 2. Duplicate Detection Methods

#### AI Embeddings (Primary)
1. Generate embedding for new report text
2. Find nearby reports within radius and time window
3. Compare embeddings using cosine similarity
4. Flag matches above threshold

#### Rule-Based (Fallback)
1. Normalize text (lowercase, remove punctuation)
2. Find nearby reports within radius and time window
3. Compare using:
   - Exact string matching
   - Jaccard similarity (token overlap)
   - Levenshtein distance
4. Flag matches above thresholds

### 3. Geographic and Temporal Filtering

- **Geographic**: Only compares reports within configured radius
- **Temporal**: Only considers reports within configured time window
- **City Scoping**: Only compares reports within the same city

## API Endpoints

### Check for Duplicates
```http
POST /api/reports/check-duplicate
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Broken streetlight",
  "description": "Streetlight not working on Main St",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "success": true,
  "duplicate": true,
  "matches": [
    {
      "id": "report-id",
      "title": "Streetlight Issue",
      "excerpt": "Broken streetlight on Main Street...",
      "similarity": 0.85,
      "status": "OPEN",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Report (with duplicate check)
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Broken streetlight",
  "description": "Streetlight not working on Main St",
  "category": "POWER",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "force": false  // Set to true to bypass duplicate check
}
```

**Duplicate Response (409 Conflict):**
```json
{
  "error": "Potential duplicate report detected",
  "duplicate": true,
  "matches": [...]
}
```

## Frontend Integration

The frontend automatically:
1. Checks for duplicates before submission
2. Shows modal with similar reports if found
3. Allows users to view existing reports or submit anyway
4. Handles both client-side and server-side duplicate detection

## Performance Considerations

- **Candidate Limiting**: Maximum 100 candidates per search
- **Async Embedding Storage**: Embeddings stored after report creation
- **Caching**: Geographic and temporal filtering reduces database load
- **Timeout Handling**: 10-second timeout for AI model requests

## Monitoring and Logging

The system logs:
- Duplicate detection events (non-sensitive)
- Embedding generation failures
- Fallback to rule-based matching
- Performance metrics

## Troubleshooting

### Common Issues

1. **No duplicates detected when expected**
   - Check `DUPLICATE_CHECK_ENABLED=true`
   - Verify geographic radius settings
   - Check time window configuration
   - Ensure AI model is working (if using embeddings)

2. **Too many false positives**
   - Increase `DUPLICATE_EMBEDDING_THRESHOLD`
   - Adjust geographic radius
   - Check AI model quality

3. **AI model not working**
   - Verify Ollama is running (if using Ollama)
   - Check API key (if using OpenAI)
   - System will automatically fallback to rule-based matching

4. **Performance issues**
   - Reduce `DUPLICATE_GEO_RADIUS_METERS`
   - Decrease `DUPLICATE_TIME_WINDOW_MINUTES`
   - Check database indexes

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Security Considerations

- **Data Privacy**: Ollama keeps data local, OpenAI sends data to external servers
- **Input Validation**: All inputs are sanitized and validated
- **Rate Limiting**: Duplicate check endpoint has rate limiting
- **Authentication**: All endpoints require valid authentication

## Future Enhancements

- **Admin Review**: Mark duplicates for admin review
- **Merge Reports**: Allow merging of duplicate reports
- **Custom Models**: Support for custom embedding models
- **Analytics**: Duplicate detection analytics dashboard
- **Batch Processing**: Process existing reports for embeddings

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify configuration settings
3. Test with rule-based fallback first
4. Check database migration status
