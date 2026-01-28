-- Block all INSERT operations on admin_emails (only allow direct database management)
CREATE POLICY "No public inserts on admin_emails"
ON public.admin_emails
FOR INSERT
TO public
WITH CHECK (false);

-- Block all UPDATE operations on admin_emails
CREATE POLICY "No public updates on admin_emails"
ON public.admin_emails
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);

-- Block all DELETE operations on admin_emails
CREATE POLICY "No public deletes on admin_emails"
ON public.admin_emails
FOR DELETE
TO public
USING (false);