import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../../models/User';
import connectToDatabase from '../../../../lib/mongodb';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const body = await req.json();
    const { name, email } = body;

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await connectToDatabase();

    // If email changed, check if it's already taken
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated', user: { name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
