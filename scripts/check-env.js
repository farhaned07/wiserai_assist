#!/usr/bin/env node

/**
 * This script checks if the required environment variables are set.
 * Run it with: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });

const chalk = require('chalk');

console.log(chalk.bold('\nChecking environment variables...\n'));

const requiredEnvVars = [
  {
    name: 'DEEPSEEK_API_KEY',
    description: 'DeepSeek API Key',
    link: 'https://platform.deepseek.com/'
  }
];

let hasErrors = false;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar.name];
  
  if (!value) {
    console.log(chalk.red(`❌ ${envVar.name} is missing`));
    console.log(chalk.yellow(`   Get it from: ${envVar.link}`));
    console.log(chalk.yellow(`   Add it to your .env.local file:\n`));
    console.log(chalk.gray(`   ${envVar.name}=your_${envVar.name.toLowerCase()}_here\n`));
    hasErrors = true;
  } else if (value.includes('your_') || value === 'undefined' || value === '') {
    console.log(chalk.red(`❌ ${envVar.name} has a placeholder value: "${value}"`));
    console.log(chalk.yellow(`   Get a real value from: ${envVar.link}`));
    console.log(chalk.yellow(`   Update it in your .env.local file\n`));
    hasErrors = true;
  } else {
    console.log(chalk.green(`✅ ${envVar.name} is set`));
    console.log(chalk.gray(`   ${envVar.description} is configured correctly\n`));
  }
});

if (hasErrors) {
  console.log(chalk.red.bold('\n⚠️  Fix the above issues before running the application\n'));
  process.exit(1);
} else {
  console.log(chalk.green.bold('\n✅ All required environment variables are set!\n'));
} 