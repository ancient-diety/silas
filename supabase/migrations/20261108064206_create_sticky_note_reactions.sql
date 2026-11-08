CREATE TABLE public.sticky_note_reactions (
    note_id bigint NOT NULL CHECK (note_id > 0),
    client_id uuid NOT NULL,
    emoji text NOT NULL CHECK (emoji IN ('❤️', '😂', '🥺', '👍', '✨', '👀')),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT sticky_note_reactions_pkey PRIMARY KEY (note_id, client_id)
);

CREATE TABLE public.sticky_note_reaction_counts (
    note_id bigint NOT NULL CHECK (note_id > 0),
    emoji text NOT NULL CHECK (emoji IN ('❤️', '😂', '🥺', '👍', '✨', '👀')),
    reaction_count bigint NOT NULL DEFAULT 1 CHECK (reaction_count > 0),
    CONSTRAINT sticky_note_reaction_counts_pkey PRIMARY KEY (note_id, emoji)
);

CREATE INDEX sticky_note_reactions_note_id_idx
    ON public.sticky_note_reactions (note_id);

ALTER TABLE public.sticky_note_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_note_reaction_counts ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.sticky_note_reactions FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.sticky_note_reaction_counts FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.sticky_note_reaction_counts TO anon, authenticated;

CREATE POLICY sticky_note_reaction_counts_read
    ON public.sticky_note_reaction_counts
    FOR SELECT
    TO anon, authenticated
    USING (true);

COMMENT ON TABLE public.sticky_note_reactions IS
    'One selected emoji per note and random browser UUID. Note IDs point to the separate front-logs project.';
COMMENT ON TABLE public.sticky_note_reaction_counts IS
    'Public aggregate emoji counts for sticky notes; contains no visitor identifiers.';

CREATE OR REPLACE FUNCTION public.maintain_sticky_note_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.sticky_note_reaction_counts (note_id, emoji, reaction_count)
        VALUES (NEW.note_id, NEW.emoji, 1)
        ON CONFLICT (note_id, emoji)
        DO UPDATE SET reaction_count =
            public.sticky_note_reaction_counts.reaction_count + 1;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.note_id IS DISTINCT FROM NEW.note_id
           OR OLD.emoji IS DISTINCT FROM NEW.emoji THEN
            UPDATE public.sticky_note_reaction_counts
            SET reaction_count = reaction_count - 1
            WHERE note_id = OLD.note_id
              AND emoji = OLD.emoji;

            DELETE FROM public.sticky_note_reaction_counts
            WHERE note_id = OLD.note_id
              AND emoji = OLD.emoji
              AND reaction_count = 0;

            INSERT INTO public.sticky_note_reaction_counts (note_id, emoji, reaction_count)
            VALUES (NEW.note_id, NEW.emoji, 1)
            ON CONFLICT (note_id, emoji)
            DO UPDATE SET reaction_count =
                public.sticky_note_reaction_counts.reaction_count + 1;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.sticky_note_reaction_counts
        SET reaction_count = reaction_count - 1
        WHERE note_id = OLD.note_id
          AND emoji = OLD.emoji;

        DELETE FROM public.sticky_note_reaction_counts
        WHERE note_id = OLD.note_id
          AND emoji = OLD.emoji
          AND reaction_count = 0;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$function$;

REVOKE ALL ON FUNCTION public.maintain_sticky_note_reaction_counts()
    FROM PUBLIC, anon, authenticated;

CREATE TRIGGER sticky_note_reactions_update_counts
    AFTER INSERT OR UPDATE OF note_id, emoji OR DELETE
    ON public.sticky_note_reactions
    FOR EACH ROW
    EXECUTE FUNCTION public.maintain_sticky_note_reaction_counts();

CREATE OR REPLACE FUNCTION public.toggle_sticky_note_reaction(
    p_note_id bigint,
    p_emoji text,
    p_client_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    current_emoji text;
    inserted_count integer;
BEGIN
    IF p_note_id IS NULL OR p_note_id <= 0 THEN
        RAISE EXCEPTION 'A valid sticky note ID is required'
            USING ERRCODE = '22023';
    END IF;

    IF p_client_id IS NULL THEN
        RAISE EXCEPTION 'A reaction client ID is required'
            USING ERRCODE = '22023';
    END IF;

    IF p_emoji IS NULL OR p_emoji NOT IN ('❤️', '😂', '🥺', '👍', '✨', '👀') THEN
        RAISE EXCEPTION 'That emoji is not available for reactions'
            USING ERRCODE = '22023';
    END IF;

    LOOP
        SELECT reactions.emoji
        INTO current_emoji
        FROM public.sticky_note_reactions AS reactions
        WHERE reactions.note_id = p_note_id
          AND reactions.client_id = p_client_id
        FOR UPDATE;

        IF FOUND THEN
            IF current_emoji = p_emoji THEN
                DELETE FROM public.sticky_note_reactions
                WHERE note_id = p_note_id
                  AND client_id = p_client_id;
                RETURN false;
            END IF;

            UPDATE public.sticky_note_reactions
            SET emoji = p_emoji
            WHERE note_id = p_note_id
              AND client_id = p_client_id;
            RETURN true;
        END IF;

        INSERT INTO public.sticky_note_reactions (note_id, client_id, emoji)
        VALUES (p_note_id, p_client_id, p_emoji)
        ON CONFLICT (note_id, client_id) DO NOTHING;

        GET DIAGNOSTICS inserted_count = ROW_COUNT;
        IF inserted_count = 1 THEN
            RETURN true;
        END IF;
    END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION public.toggle_sticky_note_reaction(bigint, text, uuid)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_sticky_note_reaction(bigint, text, uuid)
    TO anon, authenticated;

ALTER PUBLICATION supabase_realtime
    ADD TABLE public.sticky_note_reaction_counts;