import React from 'react'

export const Stripe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

interface StripeCheckoutProps {
    children: React.ReactNode;
    amount: number;
    currency: string;
    onSuccess: () => void; // No arguments
}
  

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ children, amount, currency, onSuccess }) => {
    const handleClick = () => {
        console.log(`Processing payment of ${amount / 100} ${currency}`);
        onSuccess(); // Call the onSuccess function without arguments
    }
      

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}