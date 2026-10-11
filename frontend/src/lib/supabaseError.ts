import type { PostgrestError } from "@supabase/supabase-js";

// User-facing message in `message`; the raw Supabase error is kept in `cause` for debugging.
export class SupabaseRequestError extends Error {
    constructor(message: string, cause?: PostgrestError | Error | null) {
        super(message, { cause: cause ?? undefined });
        this.name = "SupabaseRequestError";
        if (cause) console.error(message, cause);
    }
}
