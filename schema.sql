/* --------------------- ELECBILLPRO DATABASE SCHEMA --------------------- */

/* --------------------- PROFILES TABLE --------------------- */
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  fullname TEXT DEFAULT '',
  first_name TEXT,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* --------------------- Enable Row Level Security --------------------- */
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

/* --------------------- Drop existing policies if they exist --------------------- */
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

/* --------------------- Policies: Users can read their own profile --------------------- */
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Allow trigger to insert profiles (SECURITY DEFINER handles this, but policy is good practice)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

/* --------------------- BILLS TABLE --------------------- */
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  consumption DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* --------------------- Enable Row Level Security --------------------- */
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

/* --------------------- Drop existing policies if they exist --------------------- */
DROP POLICY IF EXISTS "Users can view own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;

-- Create policy: Users can view their own bills
CREATE POLICY "Users can view own bills"
  ON public.bills FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bills
CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own bills
CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE
  USING (auth.uid() = user_id);

/* --------------------- Function: Automatically create profile on signup --------------------- */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_fullname TEXT;
  user_first_name TEXT;
BEGIN
  -- Extract fullname from metadata
  user_fullname := COALESCE(NEW.raw_user_meta_data->>'fullname', '');
  
  -- Extract first name (first word of fullname)
  IF user_fullname != '' THEN
    user_first_name := SPLIT_PART(user_fullname, ' ', 1);
  ELSE
    user_first_name := '';
  END IF;
  
  -- Insert profile, handle conflicts gracefully
  INSERT INTO public.profiles (id, email, fullname, first_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_fullname,
    user_first_name
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    fullname = COALESCE(NULLIF(EXCLUDED.fullname, ''), profiles.fullname),
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* --------------------- Drop existing trigger if it exists --------------------- */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

/* --------------------- Trigger: Call function on new user signup --------------------- */
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
