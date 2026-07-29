-- ============================================================================
-- RIVET CRM — Supabase PostgreSQL Database Schema & RLS Policies
-- Migration: 20260730000000_init_schema.sql
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Workspace & Multi-Tenant Schema
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members & Roles (admin, operations, accounts, viewer)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operations', 'accounts', 'viewer')) DEFAULT 'operations',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Extended User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operations', 'accounts', 'viewer')) DEFAULT 'operations',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRM Core Tables

-- Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    customer_code TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT DEFAULT 'Central HQ',
    health_status TEXT CHECK (health_status IN ('Active Lead', 'Job In Progress', 'Payment Due', 'Repeat Client')) DEFAULT 'Active Lead',
    latest_service_ref TEXT,
    last_activity_date TIMESTAMPTZ DEFAULT NOW(),
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    next_follow_up TEXT,
    primary_action_label TEXT DEFAULT 'Open Customer Hub',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service_title TEXT NOT NULL,
    source TEXT CHECK (source IN ('WhatsApp', 'Website', 'Phone Call', 'Referral')) DEFAULT 'Website',
    stage TEXT CHECK (stage IN ('New', 'Contacted', 'Quote Sent', 'Confirmed', 'Closed', 'Lost')) DEFAULT 'New',
    budget TEXT DEFAULT '₹0',
    quote_amount TEXT DEFAULT '₹0',
    quote_status TEXT DEFAULT 'Draft',
    next_follow_up TEXT,
    assignee TEXT DEFAULT 'Ops Desk',
    primary_action_label TEXT DEFAULT 'Follow-up Callback',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_code TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_title TEXT NOT NULL,
    scheduled_date_time TEXT NOT NULL,
    status TEXT CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    driver_name TEXT DEFAULT 'Unassigned',
    vehicle_details TEXT DEFAULT 'TBD',
    pickup_location TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    advance_paid NUMERIC(12, 2) DEFAULT 0.00,
    due_amount NUMERIC(12, 2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'UPI / Cash',
    payment_status TEXT CHECK (payment_status IN ('Pending', 'Partial', 'Paid')) DEFAULT 'Pending',
    primary_action_label TEXT DEFAULT 'Dispatch Vehicle',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    payment_code TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    job_code TEXT NOT NULL,
    service_title TEXT NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    balance_due NUMERIC(12, 2) DEFAULT 0.00,
    due_date TEXT NOT NULL,
    payment_method TEXT DEFAULT 'UPI',
    status TEXT CHECK (status IN ('Paid', 'Partial', 'Due Soon', 'Overdue')) DEFAULT 'Due Soon',
    primary_action_label TEXT DEFAULT 'Send Payment Link',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks & Reminders Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Callback', 'Quote Follow-up', 'Payment Reminder', 'Dispatch Follow-up', 'Send Note', 'General')) DEFAULT 'General',
    status TEXT CHECK (status IN ('Open', 'Due Soon', 'Overdue', 'Done')) DEFAULT 'Open',
    priority TEXT CHECK (priority IN ('Critical', 'High', 'Normal')) DEFAULT 'Normal',
    due_date_time TEXT NOT NULL,
    assignee TEXT DEFAULT 'Ops Desk',
    linked_entity_id UUID,
    linked_entity_type TEXT CHECK (linked_entity_type IN ('Lead', 'Job', 'Payment', 'Customer')),
    linked_entity_name TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Ops Staff',
    text TEXT NOT NULL,
    linked_entity_id UUID NOT NULL,
    linked_entity_type TEXT NOT NULL CHECK (linked_entity_type IN ('customer', 'lead', 'job', 'payment', 'task')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log & Audit Trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'System',
    category TEXT CHECK (category IN ('lead', 'quote', 'callback', 'job', 'payment', 'customer', 'task')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    entity_id UUID,
    entity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automated Functions & Triggers

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create User Profile & Workspace on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_ws_id UUID;
BEGIN
    -- Create default workspace for user
    INSERT INTO public.workspaces (name, slug)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'organization', 'Central HQ Workspace'), 'hq-' || SUBSTRING(NEW.id::text FROM 1 FOR 8))
    RETURNING id INTO default_ws_id;

    -- Add user to workspace as admin
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (default_ws_id, NEW.id, 'admin');

    -- Create user profile
    INSERT INTO public.user_profiles (id, workspace_id, full_name, email, role)
    VALUES (
        NEW.id,
        default_ws_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        'admin'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind new user signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Row Level Security (RLS) Policies

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper check function: User belongs to workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Workspaces & Profiles
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces FOR SELECT USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can view members in their workspace" ON public.workspace_members FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can view user profiles in their workspace" ON public.user_profiles FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (id = auth.uid());

-- RLS Policies for Customers
CREATE POLICY "Workspace members view customers" ON public.customers FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert customers" ON public.customers FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members update customers" ON public.customers FOR UPDATE USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Leads
CREATE POLICY "Workspace members view leads" ON public.leads FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert leads" ON public.leads FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members update leads" ON public.leads FOR UPDATE USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Jobs
CREATE POLICY "Workspace members view jobs" ON public.jobs FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert jobs" ON public.jobs FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members update jobs" ON public.jobs FOR UPDATE USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Payments
CREATE POLICY "Workspace members view payments" ON public.payments FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert payments" ON public.payments FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members update payments" ON public.payments FOR UPDATE USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Tasks
CREATE POLICY "Workspace members view tasks" ON public.tasks FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert tasks" ON public.tasks FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members update tasks" ON public.tasks FOR UPDATE USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Notes
CREATE POLICY "Workspace members view notes" ON public.notes FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert notes" ON public.notes FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members update notes" ON public.notes FOR UPDATE USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Activity Logs
CREATE POLICY "Workspace members view activity_logs" ON public.activity_logs FOR SELECT USING (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Workspace members insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) OR workspace_id = '00000000-0000-0000-0000-000000000001');
