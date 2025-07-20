import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Simple response logic based on keywords
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
      response = "I'd be happy to help you find products! You can browse our categories like Clothing, Electronics, Home & Garden, and more. What type of product are you looking for?";
    } else if (lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
      response = "For order inquiries, you can check your order status in your account dashboard. If you need help placing an order, I can guide you through the process!";
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      response = "We offer fast shipping on all orders! Standard shipping takes 3-5 business days, and express shipping is available for next-day delivery.";
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      response = "We have a 30-day return policy for all items. You can initiate a return from your account dashboard or contact our support team for assistance.";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('discount')) {
      response = "We offer competitive prices and regular discounts! Check out our Deals section for current promotions and special offers.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! Welcome to Entropic! I'm here to help you with any questions about our products, orders, shipping, or anything else you need assistance with.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = "I'm here to help! You can ask me about products, orders, shipping, returns, or any other questions you have about shopping with us.";
    } else {
      response = "Thank you for your message! I understand you're asking about: " + message + ". I'm here to help with any questions about our products, orders, shipping, or returns. How can I assist you further?";
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
