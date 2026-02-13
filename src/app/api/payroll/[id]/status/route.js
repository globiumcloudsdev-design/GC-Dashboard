//src/app/api/payroll/[id]/status/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payroll from '@/Models/Payroll';
import Agent from '@/Models/Agent';
import Shift from '@/Models/Shift';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    if (!['paid','unpaid','cancelled','processed','failed','refunded','adjusted'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const payroll = await Payroll.findById(id);
    if (!payroll) return NextResponse.json({ success: false, error: 'Payroll not found' }, { status: 404 });

    payroll.status = status;
    if (status === 'paid') payroll.paymentDate = new Date();
    if (status !== 'paid') payroll.paymentDate = undefined;

    await payroll.save();

    return NextResponse.json({ success: true, data: payroll, message: `Payroll marked as ${status}` });
  } catch (error) {
    console.error('PUT Payroll Status Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update payroll status', details: error.message }, { status: 500 });
  }
}
