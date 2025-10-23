-- Insert test users with hashed passwords
-- Note: These are example hashes - in production, use proper bcrypt hashing
INSERT INTO users (username, email, password_hash, bio) VALUES
('testuser1', 'test1@example.com', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Fitness enthusiast and gym regular'),
('testuser2', 'test2@example.com', '$2b$10$sRZ9L0wM3nO4pP5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU', 'CrossFit athlete and nutrition coach'),
('testuser3', 'test3@example.com', '$2b$10$tSZ0M1xN4oP5qQ6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV', 'Yoga instructor and wellness advocate'),
('john_doe', 'john@example.com', '$2b$10$uTZ1N2yO5pQ6rR7tU8vW9xY0zA1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW', 'Personal trainer and fitness blogger'),
('jane_smith', 'jane@example.com', '$2b$10$vUZ2O3zP6qR7sS8tV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX', 'Marathon runner and endurance athlete');
