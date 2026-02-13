import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payroll from '@/Models/Payroll';
import { generatePayrollDescription } from '@/lib/payrollUtils';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const payroll = await Payroll.findById(id).populate('agent');
    if (!payroll) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payroll not found' 
      }, { status: 404 });
    }

    // If description exists in DB, use it, otherwise generate new
    let description = payroll.description;
    if (!description) {
      // Convert payroll document to plain object for description generation
      const payrollObj = payroll.toObject();
      description = generatePayrollDescription(payrollObj);
      
      // Save for future use
      payroll.description = description;
      await payroll.save();
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        description,
        payrollId: payroll._id,
        agentName: payroll.agent?.agentName,
        month: payroll.month,
        year: payroll.year
      } 
    });

  } catch (error) {
    console.error('GET Payroll Description Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch payroll description', 
      details: error.message 
    }, { status: 500 });
  }
}

// Regenerate description if needed
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const payroll = await Payroll.findById(id).populate('agent');
    if (!payroll) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payroll not found' 
      }, { status: 404 });
    }

    // Generate fresh description
    const payrollObj = payroll.toObject();
    const description = generatePayrollDescription(payrollObj);
    
    // Update and save
    payroll.description = description;
    await payroll.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Description regenerated successfully',
      data: { description } 
    });

  } catch (error) {
    console.error('POST Payroll Description Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to regenerate description', 
      details: error.message 
    }, { status: 500 });
  }
}