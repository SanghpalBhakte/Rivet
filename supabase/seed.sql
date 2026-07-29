-- ============================================================================
-- RIVET CRM — Supabase Seed Data for Development
-- File: supabase/seed.sql
-- ============================================================================

-- 1. Insert Initial Dev Workspace
INSERT INTO public.workspaces (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Central Ops HQ', 'central-hq')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Seed Customers
INSERT INTO public.customers (id, workspace_id, customer_code, name, phone, email, city, health_status, latest_service_ref, total_spent, outstanding_balance, next_follow_up, primary_action_label)
VALUES 
('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'CUST-101', 'Rajesh Sharma', '+91 98220 12345', 'rajesh.sharma@example.com', 'Airport Area', 'Payment Due', 'JOB-901', 14200.00, 1200.00, 'Today, 4:00 PM', 'Log Internal Note'),
('c0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'CUST-102', 'Priya Patel', '+91 98221 67890', 'priya.patel@example.com', 'Civil Lines', 'Active Lead', 'LD-502', 8500.00, 0.00, 'Tomorrow, 11:30 AM', 'Schedule Follow-up'),
('c0000003-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'CUST-103', 'Vikramaditya Rao', '+91 98222 11223', 'v.rao@example.com', 'IT Park Zone', 'Repeat Client', 'JOB-903', 42500.00, 0.00, 'Aug 2, 2:00 PM', 'Log Internal Note')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Seed Leads
INSERT INTO public.leads (id, workspace_id, customer_id, customer_name, customer_phone, customer_email, service_title, source, stage, budget, quote_amount, quote_status, next_follow_up, assignee, primary_action_label)
VALUES
('l0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000002', 'Priya Patel', '+91 98221 67890', 'priya.patel@example.com', 'Corporate Sedan Fleet Transfer', 'Website', 'Quote Sent', '₹8,500', '₹8,500', 'Sent via WhatsApp', 'Tomorrow, 11:30 AM', 'Suresh M.', 'Follow-up Callback'),
('l0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Rajesh Sharma', '+91 98220 12345', 'rajesh.sharma@example.com', 'Airport Express Pickup (Ertiga)', 'WhatsApp', 'Confirmed', '₹2,400', '₹2,400', 'Approved', 'Today, 4:00 PM', 'Janai Desk', 'Dispatch Vehicle')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Seed Jobs
INSERT INTO public.jobs (id, workspace_id, job_code, customer_id, lead_id, customer_name, customer_phone, service_title, scheduled_date_time, status, driver_name, vehicle_details, pickup_location, drop_location, total_amount, advance_paid, due_amount, payment_method, payment_status, primary_action_label)
VALUES
('j0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'JOB-901', 'c0000001-0000-0000-0000-000000000001', 'l0000002-0000-0000-0000-000000000002', 'Rajesh Sharma', '+91 98220 12345', 'Airport Express Pickup — Ertiga', 'Today, 4:30 PM', 'In Progress', 'Ramesh K.', 'Swift Dzire MH-31 EA 4091', 'Airport Terminal', 'City Center Hotel', 2400.00, 1200.00, 1200.00, 'UPI / Cash', 'Partial', 'Mark Completed'),
('j0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'JOB-903', 'c0000003-0000-0000-0000-000000000003', NULL, 'Vikramaditya Rao', '+91 98222 11223', 'Full Day Executive SUV Rental', 'Tomorrow, 9:00 AM', 'Scheduled', 'Unassigned', 'Innova Crysta MH-31 BC 8821', 'IT Park HQ', 'Industrial Zone B', 6500.00, 6500.00, 0.00, 'Corporate Billing', 'Paid', 'Dispatch Vehicle')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Seed Payments
INSERT INTO public.payments (id, workspace_id, payment_code, customer_id, job_id, customer_name, customer_phone, job_code, service_title, total_amount, amount_paid, balance_due, due_date, payment_method, status, primary_action_label)
VALUES
('p0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'PAY-401', 'c0000001-0000-0000-0000-000000000001', 'j0000001-0000-0000-0000-000000000001', 'Rajesh Sharma', '+91 98220 12345', 'JOB-901', 'Airport Express Pickup — Ertiga', 2400.00, 1200.00, 1200.00, 'Today, 6:00 PM', 'UPI', 'Partial', 'Send Payment Link'),
('p0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'PAY-402', 'c0000003-0000-0000-0000-000000000003', 'j0000002-0000-0000-0000-000000000002', 'Vikramaditya Rao', '+91 98222 11223', 'JOB-903', 'Full Day Executive SUV Rental', 6500.00, 6500.00, 0.00, 'Yesterday', 'Bank Transfer', 'Paid', 'View Invoice Receipt')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Seed Tasks
INSERT INTO public.tasks (id, workspace_id, title, type, status, priority, due_date_time, assignee, linked_entity_id, linked_entity_type, linked_entity_name, notes)
VALUES
('t0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Confirm balance payment of ₹1,200 with Rajesh Sharma', 'Payment Reminder', 'Overdue', 'Critical', 'Today, 4:00 PM', 'Janai Desk', 'p0000001-0000-0000-0000-000000000001', 'Payment', 'Rajesh Sharma', 'Client promised UPI settlement after airport arrival.'),
('t0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Follow up on corporate sedan quote approval', 'Quote Follow-up', 'Due Soon', 'High', 'Tomorrow, 11:30 AM', 'Suresh M.', 'l0000001-0000-0000-0000-000000000001', 'Lead', 'Priya Patel', 'Priya requested custom GST invoice breakdown.')
ON CONFLICT (id) DO NOTHING;
