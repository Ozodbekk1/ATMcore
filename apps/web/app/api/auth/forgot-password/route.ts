import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '../../../../../lib/mongodb';
import { User } from '../../../../../models/User';
import { sendResetPasswordEmail } from '../../../../../services/emailService';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ message: 'If an account exists, a reset instruction has been sent.' }, { status: 200 }); // Prevent email enumeration
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        await user.save();
        
        try {
            await sendResetPasswordEmail(email, resetToken);
        } catch(e) {
            console.error('Password reset email failed:', e);
        }

        return NextResponse.json({ message: 'If an account exists, a reset instruction has been sent.' }, { status: 200 });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
