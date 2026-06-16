import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    await db.connectDB();
    const { User } = db;
    const UserModel = User as any;
    
    const result1 = await UserModel.updateOne({_id: 'agent-harsh'}, {$set: {name: 'Male Herbal Consultant'}});
    const result2 = await UserModel.updateOne({_id: 'agent-anamika'}, {$set: {name: 'Female Herbal Consultant'}});
    const result3 = await UserModel.updateOne({_id: 'agent-smita'}, {$set: {name: 'Female Mental Health Support Specialist'}});
    
    return NextResponse.json({
      success: true,
      message: 'Names updated successfully in the Live Database!',
      details: {
        harsh: result1.modifiedCount > 0 ? 'Updated' : 'No changes',
        anamika: result2.modifiedCount > 0 ? 'Updated' : 'No changes',
        smita: result3.modifiedCount > 0 ? 'Updated' : 'No changes',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
