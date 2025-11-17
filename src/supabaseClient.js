import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://luvipxeomvwbfeyeocio.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dmlweGVvbXZ3YmZleWVvY2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzczMDYsImV4cCI6MjA3NjU1MzMwNn0.aSr6DJW2omPKw9K3wfWKYISfIhN6HXNG7N-QJ9aGvFA"
);