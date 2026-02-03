-- MyCar App Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner')),
    avatar_url TEXT,
    workshop_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workshops table
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rating NUMERIC(2,1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    image TEXT,
    specialties TEXT[] DEFAULT '{}',
    lat NUMERIC(10,6) NOT NULL,
    lng NUMERIC(10,6) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    experience TEXT DEFAULT '0 years',
    response_time TEXT DEFAULT '< 1 hour',
    completed_jobs TEXT DEFAULT '0',
    business_hours JSONB DEFAULT '{"open": "09:00", "close": "18:00", "closed_days": ["Sunday"]}',
    services JSONB DEFAULT '[]',
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plate TEXT NOT NULL,
    image TEXT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year TEXT NOT NULL,
    capacity TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    vehicle_name TEXT NOT NULL,
    vehicle_plate TEXT,
    service_type TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'QUOTED', 'PAID', 'REPAIRING', 'READY', 'COMPLETED', 'REJECTED', 'CANCELLED')),
    total_amount NUMERIC(10,2),
    quote_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]',
    labor NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    diagnosis JSONB,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for quote_id in bookings
ALTER TABLE bookings ADD CONSTRAINT bookings_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    pricing_rating NUMERIC(2,1) NOT NULL CHECK (pricing_rating >= 1 AND pricing_rating <= 5),
    attitude_rating NUMERIC(2,1) NOT NULL CHECK (attitude_rating >= 1 AND attitude_rating <= 5),
    professional_rating NUMERIC(2,1) NOT NULL CHECK (professional_rating >= 1 AND professional_rating <= 5),
    comment TEXT,
    reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    status TEXT DEFAULT 'Requested' CHECK (status IN ('Requested', 'Under Review', 'Shop Responded', 'Approved', 'Rejected', 'Completed')),
    timeline JSONB DEFAULT '[]',
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table (for chat)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, workshop_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'owner')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'owner')),
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'booking', 'quote', 'payment', 'review', 'refund', 'message')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Workshops: Public read, owners can modify their own
CREATE POLICY "Workshops are viewable by everyone" ON workshops FOR SELECT USING (true);
CREATE POLICY "Owners can manage their workshop" ON workshops FOR ALL USING (auth.uid() = owner_id);

-- Vehicles: Users can manage their own vehicles
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = user_id);

-- Bookings: Customers see their bookings, workshop owners see bookings for their shop
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Relevant parties can update bookings" ON bookings FOR UPDATE USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);

-- Quotes: Similar to bookings
CREATE POLICY "Relevant parties can view quotes" ON quotes FOR SELECT USING (
    auth.uid() IN (SELECT customer_id FROM bookings WHERE id = booking_id) OR
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);
CREATE POLICY "Workshop owners can create quotes" ON quotes FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);
CREATE POLICY "Relevant parties can update quotes" ON quotes FOR UPDATE USING (
    auth.uid() IN (SELECT customer_id FROM bookings WHERE id = booking_id) OR
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);

-- Reviews: Public read, users can create/update their own
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and owners can update reviews" ON reviews FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);

-- Refunds: Similar to bookings
CREATE POLICY "Relevant parties can view refunds" ON refunds FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);
CREATE POLICY "Users can create refunds" ON refunds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Relevant parties can update refunds" ON refunds FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);

-- Conversations: Participants only
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (SELECT owner_id FROM workshops WHERE id = workshop_id)
);
CREATE POLICY "Customers can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Messages: Conversation participants only
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (
    auth.uid() IN (SELECT customer_id FROM conversations WHERE id = conversation_id) OR
    auth.uid() IN (SELECT w.owner_id FROM workshops w JOIN conversations c ON w.id = c.workshop_id WHERE c.id = conversation_id)
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update workshop rating when a new review is added
CREATE OR REPLACE FUNCTION public.update_workshop_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC(2,1);
    total_reviews INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*) INTO avg_rating, total_reviews
    FROM reviews WHERE workshop_id = NEW.workshop_id;
    
    UPDATE workshops 
    SET rating = COALESCE(avg_rating, 0), reviews_count = total_reviews
    WHERE id = NEW.workshop_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating on new review
DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_workshop_rating();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_workshop_id ON bookings(workshop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_workshop_id ON reviews(workshop_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
