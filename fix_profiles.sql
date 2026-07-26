-- Corregir usuarios con name = email y email = null
UPDATE profiles
SET
  name = COALESCE(
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
    SPLIT_PART(COALESCE(
      (SELECT email FROM auth.users WHERE auth.users.id = profiles.id),
      profiles.email,
      ''
    ), '@', 1),
    profiles.name
  ),
  email = COALESCE(
    (SELECT email FROM auth.users WHERE auth.users.id = profiles.id),
    profiles.email
  )
WHERE
  profiles.name = SPLIT_PART(COALESCE(
    (SELECT email FROM auth.users WHERE auth.users.id = profiles.id),
    profiles.email,
    ''
  ), '@', 1)
  OR profiles.email IS NULL;
