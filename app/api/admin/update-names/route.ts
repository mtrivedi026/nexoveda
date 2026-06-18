import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    await db.connectDB();
    const { User } = db;
    const UserModel = User as any;
    
    const result1 = await UserModel.updateOne({email: 'harsh@nexoveda.com'}, {$set: {name: 'Male Herbal Consultant'}});
    const result2 = await UserModel.updateOne({email: 'anamika@nexoveda.com'}, {$set: {name: 'Female Herbal Consultant'}});
    const result3 = await UserModel.updateOne({email: 'smita@nexoveda.com'}, {$set: {name: 'Psychological Wellness Specialist'}});
    
    // Fetch the updated names to prove they are updated
    const harsh = await UserModel.findOne({email: 'harsh@nexoveda.com'});
    const anamika = await UserModel.findOne({email: 'anamika@nexoveda.com'});
    const smita = await UserModel.findOne({email: 'smita@nexoveda.com'});

    return NextResponse.json({
      success: true,
      message: 'Names updated successfully in the Live Database!',
      details: {
        harsh_update: result1.modifiedCount > 0 ? 'Updated' : 'No changes',
        anamika_update: result2.modifiedCount > 0 ? 'Updated' : 'No changes',
        smita_update: result3.modifiedCount > 0 ? 'Updated' : 'No changes',
      },
      current_names_in_db: {
        harsh: harsh?.name || 'NOT_FOUND',
        anamika: anamika?.name || 'NOT_FOUND',
        smita: smita?.name || 'NOT_FOUND'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
