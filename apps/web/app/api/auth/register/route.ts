import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../../lib/mongodb';
import { User } from '../../../../../models/User';
import { sendVerificationEmail } from '../../../../../services/emailService';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
      verificationToken
    });

    await user.save();
    
    // Attempt email silently to avoid blocking user creation
    try {
        await sendVerificationEmail(email, verificationToken);
    } catch(err) {
        console.error('Failed to send verification email:', err);
    }

    return NextResponse.json({ message: 'User registered successfully. Please check your email to verify.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
