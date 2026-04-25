import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
        }

        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ error: 'Password reset token is invalid or has expired' }, { status: 400 });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json({ message: 'Password has been reset successfully' });
    } catch(err: unknown) {
        return NextResponse.json({ error: (err instanceof Error ? err.message : "Internal error") }, { status: 500 });
    }
}
