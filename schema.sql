-- =========================================================
-- EDUCATION AT GLANCE
-- SUPABASE DATABASE
-- =========================================================

create extension if not exists pgcrypto;


-- =========================================================
-- PROFILES
-- =========================================================

create table if not exists public.profiles (

    id uuid
        primary key
        references auth.users(id)
        on delete cascade,

    full_name text,

    role text
        not null
        default 'user'
        check (
            role in ('user','admin')
        ),

    created_at timestamptz
        not null
        default now()

);


-- =========================================================
-- COURSES
-- =========================================================

create table if not exists public.courses (

    id uuid
        primary key
        default gen_random_uuid(),

    grade int
        not null
        unique
        check (
            grade in (8,9,10)
        ),

    name text
        not null,

    description text,

    price numeric(10,2)
        not null,

    created_at timestamptz
        not null
        default now()

);


-- =========================================================
-- SUBJECTS
-- =========================================================

create table if not exists public.subjects (

    id uuid
        primary key
        default gen_random_uuid(),

    course_id uuid
        not null
        references public.courses(id)
        on delete cascade,

    name text
        not null,

    sort_order int
        not null
        default 0,

    unique(course_id,name)

);


-- =========================================================
-- LESSONS
-- =========================================================

create table if not exists public.lessons (

    id uuid
        primary key
        default gen_random_uuid(),

    subject_id uuid
        not null
        references public.subjects(id)
        on delete cascade,

    title text
        not null,

    video_url text,

    notes_url text,

    sort_order int
        not null
        default 0,

    created_at timestamptz
        not null
        default now()

);


-- =========================================================
-- PURCHASES
-- =========================================================

create table if not exists public.purchases (

    id uuid
        primary key
        default gen_random_uuid(),

    user_id uuid
        not null
        references auth.users(id)
        on delete cascade,

    course_id uuid
        not null
        references public.courses(id)
        on delete cascade,

    status text
        not null
        default 'active'
        check (
            status in (
                'active',
                'expired',
                'pending',
                'refunded'
            )
        ),

    payment_provider text,

    payment_id text,

    purchased_at timestamptz
        not null
        default now(),

    expires_at timestamptz,

    unique(user_id,course_id)

);


-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles
enable row level security;

alter table public.courses
enable row level security;

alter table public.subjects
enable row level security;

alter table public.lessons
enable row level security;

alter table public.purchases
enable row level security;


-- =========================================================
-- ADMIN CHECK
-- =========================================================

create or replace function public.is_admin()

returns boolean

language sql

stable

security definer

set search_path = public

as $$

    select exists (

        select 1

        from public.profiles p

        where p.id = auth.uid()

        and p.role = 'admin'

    );

$$;


-- =========================================================
-- PROFILES POLICIES
-- =========================================================

drop policy if exists
"profiles_select"
on public.profiles;


create policy
"profiles_select"

on public.profiles

for select

to authenticated

using (

    id = auth.uid()

    or public.is_admin()

);


drop policy if exists
"profiles_update"
on public.profiles;


create policy
"profiles_update"

on public.profiles

for update

to authenticated

using (

    id = auth.uid()

    or public.is_admin()

)

with check (

    id = auth.uid()

    or public.is_admin()

);


-- =========================================================
-- COURSES
-- =========================================================

drop policy if exists
"courses_select"
on public.courses;


create policy
"courses_select"

on public.courses

for select

to authenticated

using (true);


-- =========================================================
-- SUBJECTS
-- =========================================================

drop policy if exists
"subjects_select"
on public.subjects;


create policy
"subjects_select"

on public.subjects

for select

to authenticated

using (true);


-- =========================================================
-- LESSONS
-- =========================================================

drop policy if exists
"lessons_select"
on public.lessons;


create policy
"lessons_select"

on public.lessons

for select

to authenticated

using (

    public.is_admin()

    or exists (

        select 1

        from public.purchases p

        join public.subjects s
            on s.course_id = p.course_id

        where
            p.user_id = auth.uid()

            and p.status = 'active'

            and s.id = lessons.subject_id

            and (
                p.expires_at is null
                or p.expires_at > now()
            )

    )

);


-- =========================================================
-- PURCHASES
-- =========================================================

drop policy if exists
"purchases_select"
on public.purchases;


create policy
"purchases_select"

on public.purchases

for select

to authenticated

using (

    user_id = auth.uid()

    or public.is_admin()

);


drop policy if exists
"purchases_admin_insert"
on public.purchases;


create policy
"purchases_admin_insert"

on public.purchases

for insert

to authenticated

with check (

    public.is_admin()

);


drop policy if exists
"purchases_admin_update"
on public.purchases;


create policy
"purchases_admin_update"

on public.purchases

for update

to authenticated

using (
    public.is_admin()
)

with check (
    public.is_admin()
);


-- =========================================================
-- LESSON ADMIN POLICIES
-- =========================================================

drop policy if exists
"lessons_admin_insert"
on public.lessons;


create policy
"lessons_admin_insert"

on public.lessons

for insert

to authenticated

with check (
    public.is_admin()
);


drop policy if exists
"lessons_admin_update"
on public.lessons;


create policy
"lessons_admin_update"

on public.lessons

for update

to authenticated

using (
    public.is_admin()
)

with check (
    public.is_admin()
);


drop policy if exists
"lessons_admin_delete"
on public.lessons;


create policy
"lessons_admin_delete"

on public.lessons

for delete

to authenticated

using (
    public.is_admin()
);


-- =========================================================
-- AUTOMATIC PROFILE CREATION
-- =========================================================

create or replace function
public.handle_new_user()

returns trigger

language plpgsql

security definer

set search_path = public

as $$

begin

    insert into public.profiles(
        id,
        full_name
    )

    values (
        new.id,
        new.raw_user_meta_data
            ->>'full_name'
    );

    return new;

end;

$$;


drop trigger if exists
on_auth_user_created
on auth.users;


create trigger
on_auth_user_created

after insert on auth.users

for each row

execute procedure
public.handle_new_user();


-- =========================================================
-- THREE COURSES
-- =========================================================

insert into public.courses
(
    grade,
    name,
    description,
    price
)

values

(
    8,
    'Class 8 Foundation Course',
    'Complete learning program for Class 8.',
    2999
),

(
    9,
    'Class 9 Concept Builder',
    'Complete learning program for Class 9.',
    3499
),

(
    10,
    'Class 10 Board Preparation',
    'Complete learning program for Class 10.',
    3999
)

on conflict (grade)

do update set

    name =
        excluded.name,

    description =
        excluded.description,

    price =
        excluded.price;


-- =========================================================
-- SUBJECTS
-- =========================================================

insert into public.subjects
(
    course_id,
    name,
    sort_order
)

select

    c.id,

    s.name,

    s.sort_order

from public.courses c

cross join
(
    values

    ('Mathematics',1),

    ('Science',2),

    ('Social Science',3),

    ('English',4),

    ('Hindi',5),

    ('Information Technology',6)

) s(name,sort_order)

on conflict(course_id,name)

do nothing;


-- =========================================================
-- AFTER CREATING YOUR ADMIN ACCOUNT:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'YOUR-SUPABASE-USER-UUID';
--
-- =========================================================
