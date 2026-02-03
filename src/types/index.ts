export type UserRole = 'customer' | 'owner';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    gender?: 'male' | 'female' | 'other';
    phone?: string;
    address?: string;
    workshopId?: string;
}

export interface WorkshopAccount {
    id: string;
    email: string;
    workshopName: string;
    role: 'owner';
    createdAt: string;
}

export interface CustomerAccount {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: 'customer';
    createdAt: string;
}

export interface ServiceDetail {
    name: string;
    category: string;
    description?: string;
    price: string;
    icon: string;
    trending?: boolean;
}
