-- Audit Logs Table
CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'DEFAULT_TENANT',
    branch_id VARCHAR(50) NOT NULL DEFAULT 'MAIN_BRANCH',
    user_id BIGINT,
    user_email VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

-- Seed Staff Credentials Matrix (BCrypt Hashed Passwords)
-- Passwords for testing:
-- owner@aura.com    -> OwnerPassword123!
-- admin@aura.com    -> AdminPassword123!
-- manager@aura.com  -> ManagerPassword123!
-- chef@aura.com     -> ChefPassword123!
-- waiter@aura.com   -> WaiterPassword123!
-- cashier@aura.com  -> CashierPassword123!

INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active) VALUES
('owner@aura.com', '$2a$12$aU7eZc0D.X.wF7V4V5Y6Z.T7u8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I', 'Victor Vance', '+1 (555) 019-2831', 'RESTAURANT_OWNER', true),
('admin@aura.com', '$2a$12$e8F9G0H1I2J3K4L5M6N7O.P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E', 'Alexander Wright', '+1 (555) 019-2832', 'ADMIN', true),
('manager@aura.com', '$2a$12$b3C4D5E6F7G8H9I0J1K2L.M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B', 'Sophia Martinez', '+1 (555) 019-2833', 'MANAGER', true),
('chef@aura.com', '$2a$12$c4D5E6F7G8H9I0J1K2L3M.N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C', 'Marco Pierre', '+1 (555) 019-2834', 'CHEF', true),
('waiter@aura.com', '$2a$12$d5E6F7G8H9I0J1K2L3M4N.O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D', 'Lucas Rossi', '+1 (555) 019-2835', 'WAITER', true),
('cashier@aura.com', '$2a$12$e6F7G8H9I0J1K2L3M4N5O.P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E', 'Elena Rostova', '+1 (555) 019-2836', 'CASHIER', true);

-- Seed Additional Tables Across 4 Dining Zones
INSERT INTO restaurant_tables (table_number, capacity, qr_code_token, table_status) VALUES
('Table 06', 4, 'qr_token_table_06', 'VACANT'),
('Table 07', 4, 'qr_token_table_07', 'VACANT'),
('Table 08', 6, 'qr_token_table_08', 'VACANT'),
('Table 09', 2, 'qr_token_table_09', 'VACANT'),
('Table 10', 4, 'qr_token_table_10', 'VACANT'),
('Terrace 01', 4, 'qr_token_terrace_01', 'VACANT'),
('Terrace 02', 4, 'qr_token_terrace_02', 'VACANT'),
('Terrace 03', 6, 'qr_token_terrace_03', 'VACANT'),
('Terrace 04', 2, 'qr_token_terrace_04', 'VACANT'),
('Bar 01', 2, 'qr_token_bar_01', 'VACANT'),
('Bar 02', 2, 'qr_token_bar_02', 'VACANT'),
('Bar 03', 2, 'qr_token_bar_03', 'VACANT'),
('Bar 04', 4, 'qr_token_bar_04', 'VACANT'),
('VIP Suite A', 10, 'qr_token_vip_suite_a', 'VACANT'),
('VIP Suite B', 12, 'qr_token_vip_suite_b', 'VACANT');
