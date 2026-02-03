export interface BankAccount {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
}

export type PayoutStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PayoutTransaction {
    id: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    status: PayoutStatus;
    timestamp: number;
}

export const MALAYSIAN_BANKS = [
    "Maybank",
    "CIMB Bank",
    "Public Bank",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "UOB Malaysia",
    "Bank Islam Malaysia",
    "OCBC Bank Malaysia",
    "Alliance Bank Malaysia"
];

const BANK_STORAGE_KEY = 'mycar_owner_bank_account';
const TRANSACTIONS_STORAGE_KEY = 'mycar_owner_payout_history';

export const payoutService = {
    getBankAccount: (email: string): BankAccount | null => {
        const stored = localStorage.getItem(`${BANK_STORAGE_KEY}_${email}`);
        return stored ? JSON.parse(stored) : null;
    },

    saveBankAccount: (email: string, account: BankAccount) => {
        localStorage.setItem(`${BANK_STORAGE_KEY}_${email}`, JSON.stringify(account));
        return { success: true };
    },

    getTransactions: (email: string): PayoutTransaction[] => {
        const stored = localStorage.getItem(`${TRANSACTIONS_STORAGE_KEY}_${email}`);
        return stored ? JSON.parse(stored) : [];
    },

    requestWithdrawal: async (email: string, amount: number, availableBalance: number): Promise<{ success: boolean; message: string }> => {
        const bank = payoutService.getBankAccount(email);
        if (!bank) return { success: false, message: "Please set up your bank account first." };
        if (amount <= 0) return { success: false, message: "Invalid withdrawal amount." };
        if (amount > availableBalance) return { success: false, message: "Insufficient balance." };

        const transactions = payoutService.getTransactions(email);
        const newTransaction: PayoutTransaction = {
            id: Math.random().toString(36).substring(2, 9).toUpperCase(),
            amount,
            bankName: bank.bankName,
            accountNumber: bank.accountNumber.slice(-4), // Masked
            status: 'REQUESTED',
            timestamp: Date.now()
        };

        const updated = [newTransaction, ...transactions];
        localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}_${email}`, JSON.stringify(updated));

        // Simulate FPX Processing
        setTimeout(() => {
            payoutService.updateTransactionStatus(email, newTransaction.id, 'PROCESSING');
        }, 2000);

        setTimeout(() => {
            payoutService.updateTransactionStatus(email, newTransaction.id, 'COMPLETED');
        }, 10000); // 10 seconds for completion simulation

        return { success: true, message: "Withdrawal request submitted successfully." };
    },

    updateTransactionStatus: (email: string, id: string, status: PayoutStatus) => {
        const transactions = payoutService.getTransactions(email);
        const updated = transactions.map(t => t.id === id ? { ...t, status } : t);
        localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}_${email}`, JSON.stringify(updated));

        // Dispatch event for UI update if needed
        window.dispatchEvent(new Event('payout_status_updated'));
    },

    getPayoutSummary: (email: string, currentBalance: number) => {
        const transactions = payoutService.getTransactions(email);

        const totalWithdrawn = transactions
            .filter(t => t.status === 'COMPLETED')
            .reduce((acc, t) => acc + t.amount, 0);

        const pendingPayouts = transactions
            .filter(t => ['REQUESTED', 'PROCESSING'].includes(t.status))
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            available: currentBalance - pendingPayouts,
            pending: pendingPayouts,
            withdrawn: totalWithdrawn
        };
    }
};
