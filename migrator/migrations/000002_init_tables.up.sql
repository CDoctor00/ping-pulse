
CREATE TABLE IF NOT EXISTS ping_pulse.hosts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ip_address VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    status host_status DEFAULT 'UP' NOT NULL,
    parent_ip VARCHAR(20) REFERENCES ping_pulse.hosts(ip_address) ON DELETE SET NULL, 
    last_ping TIMESTAMPTZ,
    last_pulse TIMESTAMPTZ,
    pings_count INTEGER DEFAULT 0,
    disconnection_count INTEGER DEFAULT 0,
    avg_latency NUMERIC(10,5),
    avg_packet_loss NUMERIC(5,2),
    note TEXT DEFAULT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hosts_ip_address ON ping_pulse.hosts(ip_address);
CREATE INDEX idx_hosts_parent_ip ON ping_pulse.hosts(parent_ip);

CREATE TABLE IF NOT EXISTS ping_pulse.alarms (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    host_ip VARCHAR(20) NOT NULL REFERENCES ping_pulse.hosts(ip_address) ON DELETE CASCADE,
    status alarm_status DEFAULT 'PENDING',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ping_pulse.configs (
    id INTEGER PRIMARY KEY CHECK (id = 1), 
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
