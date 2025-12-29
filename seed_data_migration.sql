-- =====================================================
-- ShareBite Seed Data Migration
-- =====================================================
-- Creates test users and diverse food listings with:
-- - Varied expiry times (hours to days)
-- - Different Mumbai locations
-- - Real food images
-- - Proper categorization
-- =====================================================

-- 1. CREATE NEW TEST USERS
-- =====================================================

-- Insert new users (maaz and shahid) if they don't exist
DO $$
BEGIN
  -- Insert maaz user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'maaz@sharebite.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      'maaz@sharebite.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Insert shahid user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shahid@sharebite.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
      'shahid@sharebite.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
  END IF;
END $$;

-- Create profiles for new users
INSERT INTO public.profiles (id, email, role, display_name, full_name, bio, location_city, location_lat, location_lng, is_verified, impact_score, created_at, updated_at)
VALUES 
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'maaz@sharebite.com',
    'restaurant',
    'Maaz Kitchen',
    'Maaz Ahmed',
    'Serving authentic Mumbai street food',
    'Bandra',
    19.0596,
    72.8295,
    true,
    45,
    now(),
    now()
  ),
  (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'shahid@sharebite.com',
    'ngo',
    'Shahid Food Bank',
    'Shahid Khan',
    'Helping feed the community',
    'Andheri',
    19.1136,
    72.8697,
    true,
    38,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE DIVERSE FOOD LISTINGS
-- =====================================================
-- 21 listings across 7 users with varied expiry times and locations

-- Get existing user IDs (assuming these exist)
DO $$
DECLARE
  user1_id uuid := (SELECT id FROM public.profiles WHERE email = 'skarsan02@gmail.com' LIMIT 1);
  user2_id uuid := (SELECT id FROM public.profiles WHERE email = 'rehman@sharebite.com' LIMIT 1);
  user3_id uuid := (SELECT id FROM public.profiles WHERE email = 'adnan@sharebite.com' LIMIT 1);
  user4_id uuid := (SELECT id FROM public.profiles WHERE email = 'affan@sharebite.com' LIMIT 1);
  user5_id uuid := (SELECT id FROM public.profiles WHERE email = 'meals@sharebite.com' LIMIT 1);
  user6_id uuid := 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'; -- maaz
  user7_id uuid := 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'; -- shahid
BEGIN

-- User 1 Listings (skarsan02@gmail.com) - Colaba area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user1_id, 'Fresh Vegetable Biryani', 'Aromatic basmati rice with mixed vegetables and spices', 'Veg', 'Rice & Grains', '15 servings', now() + interval '3 hours', now() + interval '1 hour', now() + interval '4 hours', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'available', 'Colaba Causeway, Mumbai', 18.9067, 72.8147, 18.9067, 72.8147, now() - interval '30 minutes'),
  (user1_id, 'Paneer Tikka Masala', 'Cottage cheese in rich tomato gravy', 'Veg', 'Curry & Gravy', '20 servings', now() + interval '18 hours', now() + interval '16 hours', now() + interval '20 hours', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800', 'available', 'Gateway of India, Mumbai', 18.9220, 72.8347, 18.9220, 72.8347, now() - interval '2 hours'),
  (user1_id, 'Mixed Fruit Salad', 'Fresh seasonal fruits with honey dressing', 'Veg', 'Snacks & Appetizers', '10 servings', now() + interval '6 hours', now() + interval '4 hours', now() + interval '8 hours', 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=800', 'available', 'Nariman Point, Mumbai', 18.9254, 72.8243, 18.9254, 72.8243, now() - interval '1 hour');

-- User 2 Listings (rehman@sharebite.com) - Bandra area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user2_id, 'Chicken Biryani Special', 'Hyderabadi style chicken biryani with raita', 'Non-Veg', 'Rice & Grains', '25 servings', now() + interval '12 hours', now() + interval '10 hours', now() + interval '14 hours', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 'available', 'Bandra West, Mumbai', 19.0596, 72.8295, 19.0596, 72.8295, now() - interval '45 minutes'),
  (user2_id, 'Butter Chicken with Naan', 'Creamy butter chicken with fresh naan bread', 'Non-Veg', 'Curry & Gravy', '18 servings', now() + interval '2 days', now() + interval '1 day 20 hours', now() + interval '2 days 4 hours', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', 'available', 'Linking Road, Bandra', 19.0544, 72.8294, 19.0544, 72.8294, now() - interval '3 hours'),
  (user2_id, 'Vegetable Spring Rolls', 'Crispy spring rolls with sweet chili sauce', 'Veg', 'Snacks & Appetizers', '30 pieces', now() + interval '8 hours', now() + interval '6 hours', now() + interval '10 hours', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800', 'available', 'Hill Road, Bandra', 19.0521, 72.8281, 19.0521, 72.8281, now() - interval '20 minutes');

-- User 3 Listings (adnan@sharebite.com) - Andheri area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user3_id, 'Dal Makhani with Rice', 'Creamy black lentils with steamed rice', 'Veg', 'Curry & Gravy', '22 servings', now() + interval '5 hours', now() + interval '3 hours', now() + interval '7 hours', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800', 'available', 'Andheri East, Mumbai', 19.1136, 72.8697, 19.1136, 72.8697, now() - interval '1.5 hours'),
  (user3_id, 'Assorted Sandwiches', 'Veg and non-veg sandwich platter', 'Both', 'Snacks & Appetizers', '40 pieces', now() + interval '1 day', now() + interval '20 hours', now() + interval '1 day 4 hours', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800', 'available', 'Lokhandwala, Andheri', 19.1389, 72.8331, 19.1389, 72.8331, now() - interval '4 hours'),
  (user3_id, 'Masala Dosa', 'South Indian crispy dosa with potato filling', 'Veg', 'Breakfast', '15 servings', now() + interval '4 hours', now() + interval '2 hours', now() + interval '6 hours', 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800', 'available', 'Versova, Andheri', 19.1318, 72.8115, 19.1318, 72.8115, now() - interval '50 minutes');

-- User 4 Listings (affan@sharebite.com) - Powai area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user4_id, 'Mutton Rogan Josh', 'Kashmiri style mutton curry', 'Non-Veg', 'Curry & Gravy', '12 servings', now() + interval '15 hours', now() + interval '13 hours', now() + interval '17 hours', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', 'available', 'Powai, Mumbai', 19.1176, 72.9060, 19.1176, 72.9060, now() - interval '2.5 hours'),
  (user4_id, 'Veg Hakka Noodles', 'Indo-Chinese style vegetable noodles', 'Veg', 'Rice & Grains', '20 servings', now() + interval '3 days', now() + interval '2 days 20 hours', now() + interval '3 days 4 hours', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800', 'available', 'Hiranandani Gardens, Powai', 19.1197, 72.9089, 19.1197, 72.9089, now() - interval '5 hours'),
  (user4_id, 'Chocolate Brownies', 'Freshly baked chocolate brownies', 'Veg', 'Desserts', '24 pieces', now() + interval '10 hours', now() + interval '8 hours', now() + interval '12 hours', 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800', 'available', 'Chandivali, Powai', 19.1075, 72.8978, 19.1075, 72.8978, now() - interval '1 hour');

-- User 5 Listings (meals@sharebite.com) - Dadar area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user5_id, 'Pav Bhaji', 'Mumbai street style pav bhaji', 'Veg', 'Snacks & Appetizers', '30 servings', now() + interval '7 hours', now() + interval '5 hours', now() + interval '9 hours', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', 'available', 'Dadar West, Mumbai', 19.0178, 72.8478, 19.0178, 72.8478, now() - interval '40 minutes'),
  (user5_id, 'Fish Curry with Rice', 'Coastal style fish curry with steamed rice', 'Non-Veg', 'Curry & Gravy', '16 servings', now() + interval '1 day 12 hours', now() + interval '1 day 10 hours', now() + interval '1 day 14 hours', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', 'available', 'Shivaji Park, Dadar', 19.0270, 72.8397, 19.0270, 72.8397, now() - interval '3.5 hours'),
  (user5_id, 'Idli Sambar', 'Soft idlis with sambar and chutney', 'Veg', 'Breakfast', '25 servings', now() + interval '5 hours', now() + interval '3 hours', now() + interval '7 hours', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', 'available', 'Dadar East, Mumbai', 19.0189, 72.8489, 19.0189, 72.8489, now() - interval '2 hours');

-- User 6 Listings (maaz@sharebite.com) - Bandra area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user6_id, 'Vada Pav', 'Classic Mumbai vada pav with chutney', 'Veg', 'Snacks & Appetizers', '50 pieces', now() + interval '4 hours', now() + interval '2 hours', now() + interval '6 hours', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800', 'available', 'Bandra Station, Mumbai', 19.0544, 72.8406, 19.0544, 72.8406, now() - interval '25 minutes'),
  (user6_id, 'Chicken Tikka', 'Tandoori chicken tikka pieces', 'Non-Veg', 'Snacks & Appetizers', '20 servings', now() + interval '9 hours', now() + interval '7 hours', now() + interval '11 hours', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', 'available', 'Carter Road, Bandra', 19.0502, 72.8187, 19.0502, 72.8187, now() - interval '1.5 hours'),
  (user6_id, 'Gulab Jamun', 'Sweet gulab jamun dessert', 'Veg', 'Desserts', '30 pieces', now() + interval '2 days', now() + interval '1 day 20 hours', now() + interval '2 days 4 hours', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800', 'available', 'Mount Mary, Bandra', 19.0470, 72.8262, 19.0470, 72.8262, now() - interval '6 hours');

-- User 7 Listings (shahid@sharebite.com) - Andheri area
INSERT INTO public.listings (donor_id, title, description, food_type, food_category, quantity, expiry_date, pickup_window_start, pickup_window_end, image_url, status, address, latitude, longitude, pickup_lat, pickup_lng, created_at)
VALUES
  (user7_id, 'Chole Bhature', 'Spicy chickpeas with fried bread', 'Veg', 'Curry & Gravy', '18 servings', now() + interval '6 hours', now() + interval '4 hours', now() + interval '8 hours', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800', 'available', 'Andheri West, Mumbai', 19.1352, 72.8264, 19.1352, 72.8264, now() - interval '35 minutes'),
  (user7_id, 'Egg Curry', 'Boiled eggs in spicy tomato gravy', 'Non-Veg', 'Curry & Gravy', '14 servings', now() + interval '11 hours', now() + interval '9 hours', now() + interval '13 hours', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', 'available', 'Juhu, Mumbai', 19.1075, 72.8263, 19.1075, 72.8263, now() - interval '4.5 hours'),
  (user7_id, 'Vegetable Pulao', 'Fragrant rice with mixed vegetables', 'Veg', 'Rice & Grains', '22 servings', now() + interval '1 day 6 hours', now() + interval '1 day 4 hours', now() + interval '1 day 8 hours', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800', 'available', 'Oshiwara, Andheri', 19.1489, 72.8353, 19.1489, 72.8353, now() - interval '7 hours');

END $$;

-- 3. UPDATE PROFILE STATS
-- =====================================================
-- Update impact scores and meal counts for new users

UPDATE public.profiles
SET 
  total_meals_donated = 3,
  impact_score = 15,
  updated_at = now()
WHERE email IN ('maaz@sharebite.com', 'shahid@sharebite.com');

-- =====================================================
-- SEED DATA SUMMARY
-- =====================================================
-- Created: 2 new users (maaz, shahid)
-- Created: 21 food listings across 7 users
-- Expiry range: 3 hours to 3 days
-- Locations: Various Mumbai areas (Colaba, Bandra, Andheri, Powai, Dadar)
-- Categories: Breakfast, Rice & Grains, Curry & Gravy, Snacks, Desserts
-- Food types: Veg, Non-Veg, Both
-- All listings have real Unsplash food images
-- =====================================================
