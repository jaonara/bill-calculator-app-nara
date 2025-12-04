/* --------------------- ELECBILLPRO DATABASE SCHEMA --------------------- */

/* --------------------- PROFILES TABLE --------------------- */
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  fullname TEXT NOT NULL,
  first_name TEXT,
  email TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* --------------------- Enable Row Level Security --------------------- */
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    /* --------------------- Policies:Users can read their own profile --------------------- */
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

    -- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

/* --------------------- BILLS TABLE --------------------- */
CREATE TABLE public.bills (
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
BEGIN
  INSERT INTO public.profiles (id, email, fullname, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullname', ''),
    COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'fullname', ' ', 1), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* --------------------- Trigger: Call function on new user signup --------------------- */
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();