//src/app/api/payroll/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payroll from '@/Models/Payroll';
import Agent from '@/Models/Agent';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const payroll = await Payroll.findById(id).populate('agent');
    if (!payroll) return NextResponse.json({ success: false, error: 'Payroll not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: payroll });
  } catch (error) {
    console.error('GET Payroll Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch payroll', details: error.message }, { status: 500 });
  }
}
