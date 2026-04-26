import { NextResponse } from 'next/server';
import { User } from '../../../../models/User';
import connectToDatabase from '../../../../lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    
    const users = await User.find({}).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ data: users });
  } catch (error: any) {
    console.error('Admin Users Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
