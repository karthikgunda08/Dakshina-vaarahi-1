// auraos-backend/scripts/set-owner.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const emailToUpdate = process.argv[2];

if (!emailToUpdate) {
  console.error('\n❌ Please provide the email address of the user you want to make an owner.');
  console.error('Usage: npm run set-owner -- founder@example.com\n');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI not found in your .env file.');
    console.error('Please ensure your `auraos-backend/.env` file is correctly configured.\n');
    process.exit(1);
}

const runUpdate = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected.');

        console.log(`Searching for user: ${emailToUpdate}...`);
        const user = await User.findOne({ email: emailToUpdate.toLowerCase() });

        if (!user) {
            console.error(`\n❌ User with email "${emailToUpdate}" not found.\n`);
            return;
        }

        if (user.role === 'owner') {
             console.log(`\n✅ User ${user.email} is already an owner. No changes needed.\n`);
             return;
        }

        console.log(`Found user: ${user.email}. Current role: '${user.role}'. Updating to 'owner'...`);
        user.role = 'owner';
        await user.save();

        console.log(`\n✅ Success! User ${user.email} has been granted owner privileges.\n`);

    } catch (error) {
        console.error('\n❌ An error occurred during the update process:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

runUpdate();
