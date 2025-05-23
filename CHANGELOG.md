# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Moved utility scripts to appropriate directories:
  - Deleted duplicate `update-role.js` from root directory (kept the one in server directory)
  - Moved `update-admin.js` from root directory to server directory
  - Updated path reference in `update-admin.js` for proper .env loading

### Added
- Added CHANGELOG.md to track project changes
- Implemented secure admin management system:
  - Added audit logging for role changes
  - Created secure admin seeder script (`utils/adminSeeder.js`)
  - Added API endpoints for role management
  - Added validation for role updates
  - Added documentation for admin management system