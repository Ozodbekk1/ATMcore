import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import { User } from '../../../../../models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
        return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.redirect(new URL('/login?verified=true', req.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
