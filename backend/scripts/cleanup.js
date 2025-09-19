#!/usr/bin/env node

/**
 * Cleanup script for orphaned files
 * This script removes files that are no longer referenced in the database
 */

require('dotenv').config();
const imageStorage = require('../services/imageStorage');

async function cleanupOrphanedFiles() {
  console.log('🧹 Starting cleanup of orphaned files...');

  try {
    const deletedCount = await imageStorage.cleanupOrphanedFiles();
    console.log(
      `✅ Cleanup completed. Removed ${deletedCount} orphaned files.`
    );
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupOrphanedFiles()
    .then(() => {
      console.log('🎉 Cleanup script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOrphanedFiles };
