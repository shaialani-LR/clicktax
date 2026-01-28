-- Block all INSERT operations on user_roles (roles are assigned via trigger)
CREATE POLICY "No public inserts on user_roles"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (false);

-- Block all UPDATE operations on user_roles
CREATE POLICY "No public updates on user_roles"
ON public.user_roles
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);

-- Block all DELETE operations on user_roles
CREATE POLICY "No public deletes on user_roles"
ON public.user_roles
FOR DELETE
TO public
USING (false);