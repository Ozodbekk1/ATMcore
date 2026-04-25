import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendVerificationEmail } from "@/services/emailService";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Security: always force role to USER — only superadmin can promote via admin panel
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'USER',
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
