-- Reservations Table DDL
CREATE TABLE reservations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    party_size INT NOT NULL CHECK (party_size > 0),
    reservation_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    table_id BIGINT REFERENCES restaurant_tables(id),
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_time ON reservations (reservation_time);
CREATE INDEX idx_reservations_email ON reservations (guest_email);

-- Seed Sample Reservations
INSERT INTO reservations (guest_name, guest_email, guest_phone, party_size, reservation_time, table_id, status, special_requests) VALUES
('Lord Sterling', 'sterling@luxury.com', '+1 (555) 019-9001', 4, CURRENT_TIMESTAMP, 1, 'CONFIRMED', 'Anniversary celebration. Window seat preferred.'),
('Lady Eleanor', 'eleanor@hautegastronomy.com', '+1 (555) 019-9002', 2, CURRENT_TIMESTAMP, 3, 'CONFIRMED', 'Sommelier pairing requested.');
