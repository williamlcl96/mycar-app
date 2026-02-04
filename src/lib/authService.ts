import type { UserRole, ServiceDetail } from '../types';

export interface UserAccount {
    id?: string;
    email: string;
    password?: string;
    username?: string;
    fullName?: string;
    workshopName?: string;
    role: UserRole;
    createdAt: string;
}

export interface OwnerAccount extends UserAccount {
    role: 'owner';
    workshopName: string;
    phone: string;
    address: string;
    city?: string;
    postcode?: string;
    licenseNumber?: string;
    contactEmail?: string;
    businessHours?: {
        open: string;
        close: string;
        closedDays?: string[];
        schedules?: Record<string, { open: string; close: string; isClosed: boolean }>;
    };
    coordinates?: { lat: number; lng: number };
    services?: ServiceDetail[];
    specialties?: string[];
    servicePrices?: { [serviceName: string]: string };
}

const STORAGE_KEY = 'mycar_accounts';

// Default accounts for testing
const defaultAccounts: UserAccount[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'ahmad@example.com',
        password: 'password123',
        fullName: 'Ahmad Ali',
        username: 'ahmad_ali',
        role: 'customer',
        createdAt: new Date().toISOString()
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'owner@workshop.com',
        password: 'password123',
        workshopName: 'Ah Seng Auto Services',
        role: 'owner',
        createdAt: new Date().toISOString()
    }
];

class AuthService {
    private accounts: UserAccount[] = [];

    constructor() {
        this.loadAccounts();
    }

    private loadAccounts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.accounts = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse accounts', e);
                this.accounts = [...defaultAccounts];
            }
        } else {
            this.accounts = [...defaultAccounts];
            this.saveAccounts();
        }
    }

    saveAccounts(accounts?: UserAccount[]) {
        if (accounts) {
            this.accounts = accounts;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts));
    }

    getAccounts() {
        return this.accounts;
    }

    isValidEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    registerAccount(data: UserAccount) {
        if (this.accounts.some(a => a.email.toLowerCase() === data.email.toLowerCase() && a.role === data.role)) {
            return { success: false, message: 'An account with this email/role already exists.' };
        }

        const newAccount = {
            ...data,
            id: data.id || 'acc_' + Math.random().toString(36).substr(2, 9)
        };

        this.accounts.push(newAccount);
        this.saveAccounts();
        return { success: true, account: newAccount };
    }

    loginAccount(email: string, password?: string) {
        const account = this.accounts.find(
            a => a.email.toLowerCase() === email.toLowerCase() && (!password || a.password === password)
        );

        if (account) {
            return { success: true, account };
        }
        return { success: false, message: 'Invalid email or password.' };
    }

    getAvailableRoles(email: string): UserRole[] {
        return this.accounts
            .filter(a => a.email.toLowerCase() === email.toLowerCase())
            .map(a => a.role);
    }

    getAccountByRole(email: string, role: UserRole): UserAccount | undefined {
        return this.accounts.find(
            a => a.email.toLowerCase() === email.toLowerCase() && a.role === role
        );
    }
}

export const authService = new AuthService();
