import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
 key_id: process.env.key_id!,
 key_secret: process.env.key_secret,
});

export async function POST(request: NextRequest) {
  console.log(razorpay,'razorpay in order')
 const { amount, currency } = (await request.json()) as {
  amount: string;
  currency: string;
 };

 var options = {
  amount: amount,
  currency: currency,
  receipt: 'rcp1',
 };
 const order = await razorpay.orders.create(options);
 console.log(order,'order in order api');
 return NextResponse.json({ orderId: order.id }, { status: 200 });
}