# HealthAI LifePlanner - Deployment Guide

This guide covers deploying the HealthAI LifePlanner application to production.

## Deployment Options

### Option 1: Manus Hosting (Recommended)

The application is built on the Manus full-stack template and is optimized for Manus deployment.

**Features:**
- Autoscale serverless hosting
- Custom domain support
- Automatic SSL certificates
- Built-in analytics
- Environment variable management

**Steps:**
1. Log in to your Manus dashboard
2. Click "Publish" button
3. Configure custom domain (optional)
4. Deploy

### Option 2: GitHub to Manus

1. Push code to GitHub (see README)
2. Connect GitHub repository to Manus
3. Enable auto-deploy on push
4. Manus automatically builds and deploys

### Option 3: Docker Deployment

The application can be containerized for deployment to any Docker-compatible platform.

**Build Docker image:**
```bash
docker build -t lifeplanner:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e JWT_SECRET="your_jwt_secret" \
  -e VITE_APP_ID="your_app_id" \
  -e OAUTH_SERVER_URL="your_oauth_url" \
  -e BUILT_IN_FORGE_API_KEY="your_api_key" \
  -e BUILT_IN_FORGE_API_URL="your_api_url" \
  lifeplanner:latest
```

### Option 4: Traditional Node.js Hosting

Deploy to services like Heroku, Railway, Render, or DigitalOcean App Platform.

**Build for production:**
```bash
pnpm install
pnpm build
```

**Start production server:**
```bash
NODE_ENV=production node dist/index.js
```

## Environment Variables

Required environment variables for production:

```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your_secure_jwt_secret_key
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

## Database Setup

### MySQL/TiDB

1. Create database:
```sql
CREATE DATABASE lifeplanner;
```

2. Run migrations:
```bash
pnpm drizzle-kit migrate
```

3. Verify schema:
```bash
pnpm drizzle-kit studio
```

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Build succeeds: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm check`
- [ ] Code formatted: `pnpm format`
- [ ] Git repository clean
- [ ] README updated with correct URLs
- [ ] License file included
- [ ] .gitignore configured

## Post-Deployment Verification

1. **Test Authentication**
   - Navigate to application
   - Click "Sign In"
   - Verify OAuth flow works
   - Check user data is saved

2. **Test Food Tracking**
   - Add a food entry
   - Verify it appears in Today's Log
   - Check daily summary updates
   - Test delete functionality

3. **Test Goal Management**
   - Set a fitness goal
   - Verify goal displays
   - Update goal
   - Verify changes persist

4. **Test AI Insights**
   - Generate insights (requires data)
   - Verify Gemini API integration works
   - Check error handling if API fails

5. **Test Data Privacy**
   - Create multiple user accounts
   - Verify each user only sees their data
   - Check database isolation

## Monitoring

### Application Health
- Monitor error logs
- Check response times
- Track API usage
- Monitor database performance

### Metrics to Watch
- Request latency
- Error rate
- Database query time
- API rate limits
- Memory usage

## Scaling Considerations

### Horizontal Scaling
- Manus autoscale handles this automatically
- For custom hosting, use load balancers

### Database Optimization
- Index frequently queried columns
- Monitor slow queries
- Optimize Gemini API calls

### Caching
- Consider caching AI analyses
- Cache user goals
- Cache food entry summaries

## Troubleshooting

### Database Connection Issues
```
Error: ECONNREFUSED
```
- Verify DATABASE_URL is correct
- Check database server is running
- Verify network connectivity

### OAuth Issues
```
Error: Invalid app ID
```
- Verify VITE_APP_ID is correct
- Check OAUTH_SERVER_URL
- Verify redirect URL is configured

### Gemini API Issues
```
Error: API key invalid
```
- Verify BUILT_IN_FORGE_API_KEY
- Check API endpoint URL
- Verify API quotas not exceeded

## Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Minify CSS/JS
   - Optimize images
   - Use CDN for static assets

2. **Backend**
   - Use connection pooling
   - Implement caching
   - Optimize database queries
   - Rate limit API endpoints

3. **Database**
   - Add indexes
   - Archive old data
   - Optimize queries
   - Monitor performance

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables not in code
- [ ] Database credentials secured
- [ ] API keys rotated regularly
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## Backup & Recovery

### Database Backups
```bash
# MySQL backup
mysqldump -u user -p database > backup.sql

# Restore
mysql -u user -p database < backup.sql
```

### Application Backups
- Use version control (Git)
- Tag releases
- Keep deployment history
- Document configuration

## Support & Maintenance

- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Security patches immediately
- Feature updates as needed

## Additional Resources

- [Manus Documentation](https://docs.manus.im)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [tRPC Documentation](https://trpc.io)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
