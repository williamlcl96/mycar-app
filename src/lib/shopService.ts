import { authService, type OwnerAccount } from './authService';

export const ALLOWED_SERVICES = [
    'Oil Change',
    'Engine Tuning',
    'Brake Services',
    'Tire Replacement',
    'Aircond Service',
    'Bodywork & Paint',
    'Battery Replacement',
    'Transmission Repair',
    'Suspension Work',
    'Diagnostics'
];

export const shopService = {
    /**
     * Get workshop profile data for a specific email
     */
    getShopData(email: string): OwnerAccount | null {
        const account = authService.getAccountByRole(email, 'owner');
        if (account && account.role === 'owner') {
            return account as OwnerAccount;
        }
        return null;
    },

    /**
     * Update shop data with validation
     */
    updateShopData(email: string, updates: Partial<OwnerAccount>): { success: boolean; message: string } {
        const accounts = authService.getAccounts();
        const index = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase() && a.role === 'owner');

        if (index === -1) {
            return { success: false, message: 'Shop account not found.' };
        }

        const current = accounts[index] as OwnerAccount;

        // Validation
        if (updates.workshopName === '') return { success: false, message: 'Workshop name cannot be empty.' };
        if (updates.address === '') return { success: false, message: 'Address cannot be empty.' };
        if (updates.city === '') return { success: false, message: 'City is compulsory.' };
        if (updates.postcode === '') return { success: false, message: 'Postcode is compulsory.' };
        if (updates.phone === '') return { success: false, message: 'Phone number cannot be empty.' };

        // Business Hours Validation
        if (updates.businessHours) {
            const { open, close } = updates.businessHours;
            if (!open || !close) return { success: false, message: 'Both open and close times are required.' };
            // Simple string comparison for HH:mm format
            if (open >= close) return { success: false, message: 'Closing time must be after opening time.' };
        }

        // Coordinate Validation
        if (updates.coordinates) {
            const { lat, lng } = updates.coordinates;
            if (isNaN(lat) || lat < -90 || lat > 90) return { success: false, message: 'Invalid Latitude.' };
            if (isNaN(lng) || lng < -180 || lng > 180) return { success: false, message: 'Invalid Longitude.' };
        }

        // Service Validation (Optional: Check if required fields exist)
        if (updates.services) {
            const invalidServices = updates.services.filter(s => !s.name || !s.price);
            if (invalidServices.length > 0) {
                return { success: false, message: 'All services must have a name and price.' };
            }
        }

        // Merge and Save Account
        // @ts-ignore - updates.services is now ServiceDetail[], compatible with new OwnerAccount
        accounts[index] = { ...current, ...updates };
        authService.saveAccounts(accounts);

        // SYNC: Update public workshop listing in mycar_workshops
        try {
            const workshopsJson = localStorage.getItem('mycar_workshops');
            let workshops = workshopsJson ? JSON.parse(workshopsJson) : [];
            const updatedAccount = accounts[index] as OwnerAccount;

            // Find by name OR by owner email (more reliable)
            let wIndex = workshops.findIndex((w: any) =>
                w.name === updatedAccount.workshopName ||
                w.ownerEmail === email.toLowerCase()
            );

            if (wIndex !== -1) {
                // Update existing workshop
                const existingWorkshop = workshops[wIndex];
                workshops[wIndex] = {
                    ...existingWorkshop,
                    name: updatedAccount.workshopName,
                    address: updatedAccount.address,
                    location: updatedAccount.city || existingWorkshop.location,
                    services: updatedAccount.services || [],
                    businessHours: {
                        ...existingWorkshop.businessHours,
                        ...updatedAccount.businessHours
                    },
                    ownerEmail: email.toLowerCase()
                };
            } else {
                // Create new workshop entry for newly registered shops
                const newWorkshop = {
                    id: 'ws_' + Math.random().toString(36).substr(2, 9),
                    name: updatedAccount.workshopName,
                    address: updatedAccount.address,
                    location: updatedAccount.city || 'Unknown',
                    rating: 4.5,
                    reviews: 0,
                    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400',
                    services: updatedAccount.services || [],
                    businessHours: updatedAccount.businessHours || { open: '09:00', close: '18:00' },
                    lat: updatedAccount.coordinates?.lat || 3.139,
                    lng: updatedAccount.coordinates?.lng || 101.6869,
                    status: 'ACTIVE',
                    ownerEmail: email.toLowerCase()
                };
                workshops.push(newWorkshop);
            }

            localStorage.setItem('mycar_workshops', JSON.stringify(workshops));
        } catch (e) {
            console.error("Failed to sync workshop data:", e);
        }

        return { success: true, message: 'Shop profile updated successfully and synced!' };
    }
};
