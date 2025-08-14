// auraos-backend/scripts/seed-users.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

const DUMMY_USERS = [
    {
        email: 'colleague1@example.com',
        name: 'Alex Doe',
        profession: 'Architect',
        password: 'password123',
    },
    {
        email: 'client.test@example.com',
        name: 'Jane Smith',
        profession: 'Client',
        password: 'password123',
    },
    {
        email: 'junior.arch@example.com',
        name: 'Sam Wilson',
        profession: 'Junior Architect',
        password: 'password123',
    }
];

if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI not found in your .env file.');
    console.error('Please ensure your `auraos-backend/.env` file is correctly configured.\n');
    process.exit(1);
}

const seedUsers = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected.');

        console.log('Seeding dummy users...');
        for (const userData of DUMMY_USERS) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists. Skipping.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            const newUser = new User({
                email: userData.email,
                name: userData.name,
                profession: userData.profession,
                passwordHash,
                credits: 100, // Give them some credits too
            });
            await newUser.save();
            console.log(`✅ Created user: ${userData.email}`);
        }
        console.log('\nDummy user seeding complete!');
        console.log('You can now invite them to projects using their example emails.');

    } catch (error) {
        console.error('\n❌ An error occurred during the seeding process:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

seedUsers();
