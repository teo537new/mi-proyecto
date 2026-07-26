-- Arreglar el trigger que crea perfiles automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1),
      'Usuario'
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$function$;
