export type PaymentMethodType = 'card' | 'fpx' | 'ewallet';

export interface PaymentDetails {
    method: PaymentMethodType;
    card?: {
        number: string;
        expiry: string;
        cvv: string;
        name: string;
    };
    fpx?: {
        bankCode: string;
        bankName: string;
    };
    ewallet?: {
        provider: string; // 'grabpay' | 'tng'
    };
}

export type PaymentStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'PENDING';

export interface PaymentTransaction {
    id: string;
    bookingId: string;
    amount: number;
    method: PaymentMethodType;
    status: PaymentStatus;
    timestamp: string;
    details: any;
}

export const MALAYSIAN_BANKS = [
    { code: 'MBB', name: 'Maybank2u' },
    { code: 'CIMB', name: 'CIMB Clicks' },
    { code: 'PBB', name: 'Public Bank' },
    { code: 'RHB', name: 'RHB Now' },
    { code: 'HLB', name: 'Hong Leong Connect' },
    { code: 'AMB', name: 'AmOnline' },
    { code: 'UOB', name: 'UOB' },
    { code: 'BIMB', name: 'Bank Islam' }
];

export const EWALLETS = [
    { id: 'grabpay', name: 'GrabPay', icon: 'wallet' },
    { id: 'tng', name: 'Touch \'n Go eWallet', icon: 'qr_code_2' }
];

export const paymentService = {
    /**
     * Simulate payment processing with method-specific logic
     */
    async processPayment(
        _bookingId: string,
        _amount: number,
        details: PaymentDetails
    ): Promise<{ status: PaymentStatus; transactionId: string; error?: string }> {
        const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Base delay for all payments
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Method-specific simulations
        switch (details.method) {
            case 'card':
                // Basic validation (simulated)
                if (!details.card?.number || details.card.number.length < 16) {
                    return { status: 'FAILED', transactionId, error: 'Invalid card number' };
                }

                // Random failure simulation (5% chance)
                if (Math.random() < 0.05) {
                    return { status: 'FAILED', transactionId, error: 'Transaction declined by bank' };
                }

                return { status: 'SUCCESS', transactionId };

            case 'fpx':
                if (!details.fpx?.bankCode) {
                    return { status: 'FAILED', transactionId, error: 'No bank selected' };
                }

                // FPX often has "Pending" states
                const fpxRoll = Math.random();
                if (fpxRoll < 0.1) {
                    return { status: 'PENDING', transactionId };
                } else if (fpxRoll < 0.15) {
                    return { status: 'FAILED', transactionId, error: 'Bank server timeout' };
                }

                return { status: 'SUCCESS', transactionId };

            case 'ewallet':
                // E-wallets are usually instant but can fail if balance is low
                if (Math.random() < 0.05) {
                    return { status: 'FAILED', transactionId, error: 'Insufficient wallet balance' };
                }

                return { status: 'SUCCESS', transactionId };

            default:
                return { status: 'FAILED', transactionId, error: 'Unsupported payment method' };
        }
    }
};
