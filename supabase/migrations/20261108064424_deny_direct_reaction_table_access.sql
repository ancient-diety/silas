DROP INDEX public.sticky_note_reactions_note_id_idx;

CREATE POLICY sticky_note_reactions_deny_direct_access
    ON public.sticky_note_reactions
    FOR ALL
    TO anon, authenticated
    USING (false)
    WITH CHECK (false);