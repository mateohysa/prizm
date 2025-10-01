# Security Policy

## Reporting a Vulnerability

The security of Prizm is a top priority. If you discover a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **Email**: Send details to [your-security-email@example.com]
2. **Subject Line**: Include "SECURITY" in the subject line
3. **Details**: Provide as much information as possible about the vulnerability

### What to Include

To help us understand and resolve the issue quickly, please include:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Affected component(s)** (e.g., specific files, routes, or features)
- **Step-by-step instructions** to reproduce the issue
- **Proof of concept** or exploit code (if available)
- **Impact assessment** (what an attacker could achieve)
- **Suggested fix** (if you have one)

### What to Expect

- **Initial Response**: We'll acknowledge your report within 48 hours
- **Status Updates**: We'll keep you informed about our progress
- **Timeline**: We aim to resolve critical vulnerabilities within 7-14 days
- **Credit**: We'll acknowledge your contribution (unless you prefer to remain anonymous)

### Safe Harbor

We consider security research conducted in accordance with this policy to be:

- Authorized concerning any applicable anti-hacking laws
- Lawful and won't pursue legal action against you
- Beneficial to the community, and we appreciate your efforts

### Security Best Practices

When using Prizm, please follow these security guidelines:

#### For Self-Hosting

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique API keys and secrets
   - Rotate credentials regularly
   - Limit API key permissions to minimum required scope

2. **Database Security**
   - Use strong database passwords
   - Enable SSL/TLS for database connections
   - Regularly backup your database
   - Keep database software up to date

3. **Authentication**
   - Configure Clerk with appropriate security settings
   - Enable multi-factor authentication (MFA)
   - Set session timeout limits
   - Review user access logs regularly

4. **Network Security**
   - Use HTTPS in production (required)
   - Configure proper CORS policies
   - Implement rate limiting for API endpoints
   - Use a WAF (Web Application Firewall) if possible

5. **Dependencies**
   - Regularly update npm packages
   - Run `npm audit` and address vulnerabilities
   - Review dependency licenses and security advisories

6. **Server Configuration**
   - Keep Node.js and system packages updated
   - Disable unnecessary services
   - Configure proper file permissions
   - Enable logging and monitoring

#### For Users

1. **Account Security**
   - Use strong, unique passwords
   - Enable MFA if available
   - Don't share account credentials
   - Log out from shared devices

2. **Data Privacy**
   - Be mindful of sensitive content in presentations
   - Understand that AI providers may process your content
   - Review project sharing settings
   - Regularly review access logs

3. **Safe Practices**
   - Keep your browser updated
   - Be cautious of phishing attempts
   - Verify URLs before entering credentials
   - Report suspicious activity

## Security Features

### Current Implementation

- ✅ **Authentication**: Clerk-based authentication with session management
- ✅ **Authorization**: Server-side ownership checks on all protected resources
- ✅ **Input Validation**: Zod schema validation for user inputs
- ✅ **SQL Injection Protection**: Prisma ORM with parameterized queries
- ✅ **XSS Prevention**: React's built-in XSS protection + sanitization
- ✅ **CSRF Protection**: Next.js built-in CSRF protection
- ✅ **Environment Security**: Sensitive data stored in environment variables

### Planned Enhancements

- ⏳ Rate limiting on API endpoints
- ⏳ Enhanced audit logging
- ⏳ Content Security Policy (CSP) headers
- ⏳ Automated security scanning in CI/CD
- ⏳ Encrypted data at rest

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

We recommend always using the latest version for the best security and features.

## Known Limitations

- **AI Provider Data**: Content sent to AI providers (OpenAI, Google, Groq) is subject to their privacy policies
- **File Uploads**: Uploaded files are processed through Uploadcare; review their security practices
- **Third-Party Dependencies**: We rely on the security of upstream packages

## Disclosure Policy

- **Responsible Disclosure**: We follow a coordinated disclosure process
- **Public Disclosure**: After a fix is released, we'll publish a security advisory
- **CVE Assignment**: We'll request CVEs for significant vulnerabilities
- **Timeline**: Typically 90 days from initial report to public disclosure

## Security Updates

Security patches will be released as:

- **Critical**: Immediate patch release
- **High**: Within 7 days
- **Medium**: Within 30 days
- **Low**: Next regular release

## Questions?

For security-related questions that don't constitute a vulnerability report, please open a GitHub issue with the `security` label.

---

**Last Updated**: October 2025

