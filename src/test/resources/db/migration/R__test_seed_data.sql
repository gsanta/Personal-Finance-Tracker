-- Repeatable migration for test seed data
-- This will be re-applied by Flyway if the file changes

INSERT INTO payments (id, name, amount, is_income, category, created_at, updated_at) VALUES
  ('eef7d5f0-cc45-459e-90dd-7e86120150ff', 'Pizza', 1500, false, 'food', '2025-09-10', '2025-09-10'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Salary', 500000, true, 'main_income', '2025-09-01', '2025-09-01'),
  ('6fa459ea-ee8a-3ca4-894e-db77e160355e', 'Groceries', 32000, false, 'food', '2025-08-28', '2025-08-28'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'Electricity Bill', 12000, false, 'utilities', '2025-08-15', '2025-08-15'),
  ('e3588f62-1a2c-4ec5-bac1-864a46be6021', 'Freelance Project', 80000, true, 'main_income', '2025-08-01', '2025-08-01'),
  ('71c3e1ed-49c5-4d2e-9c72-b6b91f89c6a7', 'Gym Membership', 7000, false, 'health', '2025-07-25', '2025-07-25'),
  ('9b2f7a22-4377-4ec4-b1ef-87f84a7c7a24', 'Car Maintenance', 45000, false, 'misc', '2025-07-20', '2025-07-20'),
  ('2a5bc3b7-8de3-4457-bb8d-6b85f79c6b91', 'Interest Income', 2500, true, 'other_income', '2025-07-10', '2025-07-10'),
  ('8b8f3f68-2493-4c8f-83c3-6f51b92e78f1', 'Internet Bill', 6000, false, 'utilities', '2025-07-01', '2025-07-01'),
  ('5e3e8b8b-b82e-47e0-98a2-44de2a9d5d73', 'Stock Dividends', 15000, true, 'other_income', '2025-06-25', '2025-06-25'),
  ('fd89e4f7-7f6e-4f8e-9c29-21e0d3c82b54', 'Dining Out', 8500, false, 'fun', '2025-06-20', '2025-06-20'),
  ('0eb7d5d8-ff15-44c0-94cb-9ac0fa8b1e10', 'Clothes Shopping', 20000, false, 'fun', '2025-06-15', '2025-06-15'),
  ('93af25d4-bb13-466d-9f8d-5a5cc6f28e47', 'Rent', 120000, false, 'utilities', '2025-06-01', '2025-06-01'),
  ('7c1ad4b6-9828-4a42-a8d4-6f6e8e8d56ac', 'Side Hustle', 30000, true, 'other_income', '2025-05-25', '2025-05-25'),
  ('4087e3a1-3ed8-4321-9d96-bdbcd0c02f6a', 'Water Bill', 3500, false, 'utilities', '2025-05-15', '2025-05-15'),
  ('c5d5e4f3-8b1d-4c37-bbdc-492e1a487e75', 'Gift Received', 10000, true, 'other_income', '2025-05-10', '2025-05-10'),
  ('cf1c5d2e-84fd-4633-b616-93f2e662f1a3', 'Travel', 40000, false, 'fun', '2025-05-01', '2025-05-01'),
  ('e4e8a1e6-f75b-4f3b-9c9f-6a1b5e217d24', 'Medical Expenses', 22000, false, 'health', '2025-04-25', '2025-04-25'),
  ('baf2cf7c-6b7c-4a5a-89f6-99c28b4c4de7', 'Book Royalties', 5000, true, 'other_income', '2025-04-15', '2025-04-15'),
  ('ad1a7cf5-2a8f-48c1-b9c2-93a39a6a22bb', 'Streaming Subscriptions', 3000, false, 'utilities', '2025-04-01', '2025-04-01')
ON CONFLICT (id) DO NOTHING;
