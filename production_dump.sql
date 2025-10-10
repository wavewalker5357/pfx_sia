--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _system;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: -
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: -
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: -
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: form_field_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_field_options (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    field_id character varying NOT NULL,
    value text NOT NULL,
    label text NOT NULL,
    "order" character varying DEFAULT '0'::character varying NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: form_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_fields (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    type text NOT NULL,
    required character varying DEFAULT 'false'::character varying NOT NULL,
    placeholder text,
    help_text text,
    "order" character varying DEFAULT '0'::character varying NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    allow_user_additions character varying DEFAULT 'false'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    allow_multi_select character varying DEFAULT 'false'::character varying NOT NULL
);


--
-- Name: header_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.header_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    attendee_title text DEFAULT 'AI Summit Ideas'::text NOT NULL,
    attendee_subtitle text DEFAULT 'Product & Engineering Summit 2025'::text NOT NULL,
    admin_title text DEFAULT 'AI Summit Admin'::text NOT NULL,
    admin_subtitle text DEFAULT 'Platform Management Dashboard'::text NOT NULL,
    summit_resources_label text DEFAULT 'Summit Resources'::text NOT NULL,
    exit_button_label text DEFAULT 'Exit'::text NOT NULL,
    logout_button_label text DEFAULT 'Logout'::text NOT NULL,
    background_color text DEFAULT '#ffffff'::text,
    text_color text DEFAULT '#000000'::text,
    title_color text DEFAULT '#000000'::text,
    subtitle_color text DEFAULT '#666666'::text,
    border_color text DEFAULT '#e5e7eb'::text,
    background_image text,
    background_image_opacity character varying DEFAULT '0.1'::character varying NOT NULL,
    background_image_position text DEFAULT 'center'::text NOT NULL,
    background_image_size text DEFAULT 'cover'::text NOT NULL,
    header_height text DEFAULT 'auto'::text NOT NULL,
    padding_x text DEFAULT '1rem'::text NOT NULL,
    padding_y text DEFAULT '1rem'::text NOT NULL,
    mobile_breakpoint text DEFAULT '768px'::text NOT NULL,
    mobile_title_size text DEFAULT '1.5rem'::text NOT NULL,
    desktop_title_size text DEFAULT '2rem'::text NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: idea_dynamic_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_dynamic_fields (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    idea_id character varying NOT NULL,
    field_id character varying NOT NULL,
    value text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    component text NOT NULL,
    tag text NOT NULL,
    type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    total_votes integer DEFAULT 0 NOT NULL
);


--
-- Name: kanban_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kanban_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    "order" character varying DEFAULT '0'::character varying NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: landing_page_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landing_page_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    mode text DEFAULT 'summit'::text NOT NULL,
    maintenance_message text DEFAULT 'The AI Summit platform is currently under construction. Please check back soon!'::text NOT NULL,
    countdown_message text DEFAULT 'Time to start of the Pricefx Product & Engineering Summit'::text,
    summit_start_date timestamp without time zone DEFAULT (now() + '30 days'::interval),
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: statistics_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statistics_state (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    last_reset_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: summit_home_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_home_content (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text DEFAULT 'Welcome to AI Summit'::text NOT NULL,
    slug text DEFAULT 'home'::text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    is_published character varying DEFAULT 'true'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: summit_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.summit_resources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    description text,
    "order" character varying DEFAULT '0'::character varying NOT NULL,
    is_active character varying DEFAULT 'true'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


--
-- Name: view_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.view_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    default_view text DEFAULT 'list'::text NOT NULL,
    show_board_by_default character varying DEFAULT 'false'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    idea_id character varying NOT NULL,
    session_id character varying NOT NULL,
    vote_count integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: voting_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voting_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    is_open character varying DEFAULT 'false'::character varying NOT NULL,
    max_votes_per_participant integer DEFAULT 5 NOT NULL,
    started_at timestamp without time zone,
    closed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: -
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	75d28891-c282-45d9-8cec-d72261193833	4505e09c-cd22-4f13-940b-753a68e8f6cb	1	2025-09-25 11:10:42.710861+00
2	1365b070-cf8a-43c3-a8d9-890b379b46f6	4505e09c-cd22-4f13-940b-753a68e8f6cb	1	2025-09-26 08:56:12.850152+00
3	df731c73-ff0d-4402-a861-6e7106005597	4505e09c-cd22-4f13-940b-753a68e8f6cb	1	2025-09-30 08:05:55.200486+00
4	ace17cd4-cace-4c13-a6c7-a9d28dbede18	4505e09c-cd22-4f13-940b-753a68e8f6cb	1	2025-09-30 10:05:16.241592+00
5	9bca8c3c-10ac-4c30-bac5-cb6469caf25a	4505e09c-cd22-4f13-940b-753a68e8f6cb	3	2025-09-30 23:35:51.220732+00
\.


--
-- Data for Name: form_field_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_field_options (id, field_id, value, label, "order", is_active, created_at) FROM stdin;
d5773f8c-57f5-4431-8341-e3539c6021b1	67f47850-4594-4f78-a6ba-ca330ce1cd0c	idea	Idea	0	true	2025-09-26 09:11:38.090722
9a932b97-5dd6-4575-a16c-8348e6b4643a	67f47850-4594-4f78-a6ba-ca330ce1cd0c	solution	Solution	1	true	2025-09-26 09:11:43.667045
f2efd626-2079-466f-ba9a-25861c180e75	67f47850-4594-4f78-a6ba-ca330ce1cd0c	problem	Problem	2	true	2025-09-26 09:12:04.717878
81f00d5d-58c6-46cd-901f-40c49bc2dda7	877e1e4a-6f8d-4f28-a365-db7a59a166c3	copilot	Copilot	0	true	2025-09-26 09:14:49.056278
b0ad7b63-52d2-46fb-a0a2-eb3a5a47e143	877e1e4a-6f8d-4f28-a365-db7a59a166c3	python	Python	1	true	2025-09-26 09:15:23.667668
c1ef4871-1eca-4731-bd81-e7964418fc2d	877e1e4a-6f8d-4f28-a365-db7a59a166c3	groovy	Groovy	2	true	2025-09-26 09:15:27.123874
2e8760e2-dc8c-4701-bda8-61513587e479	877e1e4a-6f8d-4f28-a365-db7a59a166c3	core	Core	3	true	2025-09-26 09:15:57.744339
7178b5f6-9ae7-44ef-b5f5-e92274b6639c	877e1e4a-6f8d-4f28-a365-db7a59a166c3	mcp	MCP	3	true	2025-09-26 09:16:00.730184
e23a1e97-25a3-40ec-83c1-2f20d1e3b0fc	014505c5-0950-4856-84c6-02284d21490f	copilot	Copilot	1	true	2025-09-29 05:46:02.40323
3b27914a-8308-4a93-a332-7b66821f478a	014505c5-0950-4856-84c6-02284d21490f	LLM	LLM	1	true	2025-09-29 05:46:41.364872
f9b8be37-0622-446d-9206-583f68f7834b	014505c5-0950-4856-84c6-02284d21490f	UX	UX	3	true	2025-09-29 05:47:44.422832
559462ce-0fe5-4087-ae2f-2924bfdd285c	014505c5-0950-4856-84c6-02284d21490f	Python	Python	4	true	2025-09-29 05:51:04.230697
40bb5050-e879-478b-b14f-289dcb26b213	7b51fe3c-43eb-4290-8f57-957996cd9dc8	copilot	Copilot	0	true	2025-09-29 11:03:30.684272
4110959c-5ee2-4747-835c-7e805481bde8	7b51fe3c-43eb-4290-8f57-957996cd9dc8	quotes	Quotes	1	true	2025-09-29 11:06:45.545857
4f37c768-55c1-4afe-96cd-7aa15d1d8da5	7b51fe3c-43eb-4290-8f57-957996cd9dc8	dashboard	Dashboard	2	true	2025-09-29 11:06:56.158873
934075c5-710d-4b72-a957-2207b49899fe	7b51fe3c-43eb-4290-8f57-957996cd9dc8	accelerator	Accelerator	3	true	2025-09-29 11:07:00.132656
9a8a3015-ba69-466e-8e21-c5ef64c98665	7b51fe3c-43eb-4290-8f57-957996cd9dc8	rebate	Rebate	4	true	2025-09-29 11:07:07.315872
1d9987de-51c2-4ed2-99c9-0e6e26783c76	7b51fe3c-43eb-4290-8f57-957996cd9dc8	price_management	Price Management	5	true	2025-09-29 11:07:16.641009
b81fa853-3593-4a66-bbc8-92ed42a9d41f	7b51fe3c-43eb-4290-8f57-957996cd9dc8	admin_section	Admin Section	6	true	2025-09-29 11:07:31.943465
55410d43-2319-41e6-b197-3f58d79c2642	7b51fe3c-43eb-4290-8f57-957996cd9dc8	crm_integration	CRM Integration	7	true	2025-09-29 11:07:44.557218
715b32b0-26b3-4ade-9a4a-47fa68a3bfba	014505c5-0950-4856-84c6-02284d21490f	acc	acc	5	true	2025-09-29 11:08:18.804744
95ea9de0-76c0-4735-9d8b-8a4ee8a9c978	014505c5-0950-4856-84c6-02284d21490f	mcp	MCP	0	true	2025-09-29 05:45:56.239944
d02269a4-43b8-4481-b9fb-53d86c1def7d	7b51fe3c-43eb-4290-8f57-957996cd9dc8	agents	Agents	8	true	2025-09-30 23:38:56.143896
f5ee0eb0-7f83-41ae-9879-8bcdeddff155	7b51fe3c-43eb-4290-8f57-957996cd9dc8	platform_manager	Platform Manager	9	true	2025-09-30 23:39:09.927528
2fd78e06-31d6-48a1-8e4a-4f89ef2a3feb	7b51fe3c-43eb-4290-8f57-957996cd9dc8	custom_forms	Custom Forms	10	true	2025-09-30 23:39:16.678089
84cbfbb9-90b3-4f43-9178-2ddaec359266	7b51fe3c-43eb-4290-8f57-957996cd9dc8	optimization	Optimization	11	true	2025-09-30 23:39:22.61491
49748400-5209-48f8-b7ed-4f42e7e83a8f	7b51fe3c-43eb-4290-8f57-957996cd9dc8	analytics	Analytics	12	true	2025-09-30 23:39:37.723042
0cabdcf2-68e2-482e-a4d7-ce7851bdcaff	7b51fe3c-43eb-4290-8f57-957996cd9dc8	contracts	Contracts	13	true	2025-09-30 23:40:18.108575
fc82bfac-00a9-442c-9029-ffe608131db9	014505c5-0950-4856-84c6-02284d21490f	JSON	JSON	6	true	2025-10-01 06:30:16.620677
d5f656c5-e212-4fc6-bdcb-895c9269841d	014505c5-0950-4856-84c6-02284d21490f	quotes	quotes	7	true	2025-10-01 08:02:20.933772
371ba5e3-7b79-4adc-8e73-a41ab2e49b2f	014505c5-0950-4856-84c6-02284d21490f	Integrations	Integrations	8	true	2025-10-01 08:02:38.797132
70cd6233-6232-46b3-ab72-16a4fc45da51	014505c5-0950-4856-84c6-02284d21490f	metadata	metadata	9	true	2025-10-01 12:23:45.824252
51f9d2c9-a22f-455b-bf5e-83d3da82c809	014505c5-0950-4856-84c6-02284d21490f	QAPI	QAPI	10	true	2025-10-01 12:23:51.17997
65bdd115-e0d8-405c-a919-2d3bb01df2e3	014505c5-0950-4856-84c6-02284d21490f	charts	charts	11	true	2025-10-01 12:30:38.498096
50cc4187-ed6b-46ae-8793-c95974591b44	014505c5-0950-4856-84c6-02284d21490f	queries	queries	12	true	2025-10-01 12:31:01.559235
7cab50ff-981a-4b16-bd49-c356aee6dfa2	014505c5-0950-4856-84c6-02284d21490f	context link	context link	13	true	2025-10-02 11:18:44.38872
5f1bbbf9-daf8-4aa9-a679-d65c1aaa491c	014505c5-0950-4856-84c6-02284d21490f	Documentation	Documentation	14	true	2025-10-02 12:17:45.875826
\.


--
-- Data for Name: form_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_fields (id, name, label, type, required, placeholder, help_text, "order", is_active, allow_user_additions, created_at, allow_multi_select) FROM stdin;
7b51fe3c-43eb-4290-8f57-957996cd9dc8	component	Product Topic	list	false	Product area like Analytics, Price Management, Quoting, etc.	\N	3	true	true	2025-09-29 11:02:43.282334	false
f4de0202-a39e-4010-b795-3bf6258884ce	submitter_name	Your Name	text	true	Type your full name	\N	0	true	false	2025-09-29 05:50:22.113095	false
014505c5-0950-4856-84c6-02284d21490f	tag	Tags	list	false	Select or add new tags to better mark your idea	\N	5	true	true	2025-09-29 05:45:47.666242	true
a5601f77-99af-4cb5-88a8-19ebbdabd2db	Title	Title	text	true	Title for your idea, problem or solution	\N	1	true	false	2025-09-28 20:10:58.35654	false
f61ee523-7b02-46bb-8c8d-54c78e18b1b1	Description	Description	textarea	true	Describe your idea to everyone with more details.	\N	2	true	false	2025-09-28 21:09:37.169879	false
\.


--
-- Data for Name: header_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.header_settings (id, attendee_title, attendee_subtitle, admin_title, admin_subtitle, summit_resources_label, exit_button_label, logout_button_label, background_color, text_color, title_color, subtitle_color, border_color, background_image, background_image_opacity, background_image_position, background_image_size, header_height, padding_x, padding_y, mobile_breakpoint, mobile_title_size, desktop_title_size, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: idea_dynamic_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.idea_dynamic_fields (id, idea_id, field_id, value, created_at) FROM stdin;
b1a77a9b-7e9c-425b-bd16-192d076e5607	920262c4-a8e2-4203-93b5-11c1a3451311	a5601f77-99af-4cb5-88a8-19ebbdabd2db	It's difficult to generate JSON configs	2025-10-01 06:30:19.027256
ed21fccb-f691-460a-a912-327a81dabcda	920262c4-a8e2-4203-93b5-11c1a3451311	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	Many configs like Custom Forms or Action Types are JSON. Help me!	2025-10-01 06:30:19.250669
57a61347-35a3-4d69-914a-3c5c47239890	a337bddc-d359-4c92-86dc-adc214a0c8a5	a5601f77-99af-4cb5-88a8-19ebbdabd2db	To have an MCP client	2025-10-01 06:31:05.111371
87ae264e-ddfa-4f15-b765-e75e15c5f93c	a337bddc-d359-4c92-86dc-adc214a0c8a5	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	How about using a Copilot as an MCP client to get data from Salesforce accounts?	2025-10-01 06:31:05.30297
24116406-941a-4d15-b4a2-4e7a65983aed	507b2bcd-db87-42e5-a072-a99ab499238c	a5601f77-99af-4cb5-88a8-19ebbdabd2db	built an MCP tool in Groovy	2025-10-01 06:32:30.315575
d3054d72-60ef-4d26-b762-f20327eec3b1	507b2bcd-db87-42e5-a072-a99ab499238c	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	I’ve built an MCP tool to summarize changes in Quotes and it’s amazing. See the branch:	2025-10-01 06:32:30.511419
c32e7e0e-48cd-43c7-b755-dd4e0c405fb3	d7d1be82-baff-4e01-a227-4c2f50dd07cf	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Creating publishing templates	2025-10-01 08:01:34.067889
16649cce-1bda-494b-b121-40289be82bc4	d7d1be82-baff-4e01-a227-4c2f50dd07cf	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	Creating new publishing templates especially word and email outputs can be difficult for business users. Could copilot make this easier, especially in businesses where they have many different output requirements.	2025-10-01 08:01:34.278768
05e4718b-09b4-4d44-8b6f-82db0780fd4b	f470220a-2b01-42dd-a5e6-2b71a6cb45c4	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Agents for handling B2B interactions around pricing	2025-10-01 08:02:40.591073
a4dfa2dc-5ac4-4a36-9bd1-84a9d4c914f1	f470220a-2b01-42dd-a5e6-2b71a6cb45c4	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	Agents to get/send price lists, special price agreeements/quotes, rebates, and claims.	2025-10-01 08:02:40.78098
f2529903-95f4-40b9-88ff-c55dad298527	eb2b0700-a998-4241-9fab-237a529aa1d5	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Dynamic visibility buttons configuration 	2025-10-01 08:03:09.416471
cace5632-2fcb-404d-92db-71e6dfe2d0b6	eb2b0700-a998-4241-9fab-237a529aa1d5	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	DVB configuration is a complicated JSON structure. It would be useful that an agent can edit the specific module header configuration to add the configuration from a prompt	2025-10-01 08:03:09.607168
a783a799-6754-4a57-8b88-851316ff13ad	38f606da-f121-433f-9a4b-07a920f2d444	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Distribution RFQ product mapper 	2025-10-01 08:03:34.811031
6028135c-5c66-4a00-ab03-c896e7caa0e9	38f606da-f121-433f-9a4b-07a920f2d444	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a pricing analyst or sales support user, I want to transform incoming customer quote requests into structured product data using our internal SKUs, so that I can respond more quickly and accurately to RFQs.\nTrigger/Prompt Example\nUser uploads an Excel or CSV file containing customer-requested products (usually from an RFQ email or portal download).\nTypical structure: columns for Product Name, Quantity, Unit, Customer Part #\nCopilot Response Behavior\nParses uploaded RFQ (Excel or CSV), matches each customer-provided product description against internal SKUs using semantic similarity or rules-based logic, and returns a structured quote file.\nEach row includes a confidence score to indicate the strength of the match and optionally highlights uncertain mappings for review.	2025-10-01 08:03:35.046298
b2414017-9d0c-40a5-89f6-6df1e0e02d3d	0b66cdd5-3799-4d02-9d66-9c9f7e209698	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Supplier costing	2025-10-01 08:05:41.362495
e4871278-baa3-4b00-999c-5a14eb0cc959	0b66cdd5-3799-4d02-9d66-9c9f7e209698	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a sourcing manager or procurement analyst, I want to standardize and extract pricing and SKU information from supplier cost files into a unified format, so that I can compare costs and update sourcing rules efficiently.	2025-10-01 08:05:41.572473
c41d6f68-d0b8-4cbb-ad20-bd1dac6fbc26	17a12740-38be-4018-b8b5-aed7858bb117	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Modify Generated Agents by chatting with Copilot	2025-10-01 08:44:08.668057
ecb35f66-9884-48f2-8a5d-f0140d0d75fc	17a12740-38be-4018-b8b5-aed7858bb117	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a business user I want to be able to modify some parameters from generated Agents such as thresholds, measures, schedule, filters, etc. 	2025-10-01 08:44:08.929468
1806e65f-5d6e-4196-bc6f-424a26eb7f3c	b048282f-5bde-46ec-b995-e979da3edaab	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Using Copilot to modify Agents	2025-10-01 09:02:12.976784
aa26d8a2-ef0a-441e-8c09-8b14eda6d470	b048282f-5bde-46ec-b995-e979da3edaab	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	From a generated Agents allow business users to adjusts parameters of the agents by chatting with Copilot.	2025-10-01 09:02:13.18153
84813177-5e08-4e71-be71-78cb6e117ce9	405efc78-e88e-47d3-883e-d3f0d24d9b85	a5601f77-99af-4cb5-88a8-19ebbdabd2db	UI	2025-10-01 11:08:48.170484
61b2de70-6fac-4cdd-9b63-9082c11858cd	405efc78-e88e-47d3-883e-d3f0d24d9b85	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a designer i want to itarate on the ui faster way to try out different solutions.	2025-10-01 11:08:48.376183
84504244-7156-4543-a856-dbf186b3051e	fe8c54f4-59ae-4452-90c5-7037067d92e4	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Data in Pricefx are not described enough by standardized meta data layer	2025-10-01 12:23:56.79476
bb083cf7-2f02-4d7d-80ab-36f7e076666e	fe8c54f4-59ae-4452-90c5-7037067d92e4	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	I want to be able to read Pricefx meta data using e.g. MCP tools or from the Copilot without needing to know what is the destination table or field name or without knowing the Pricefx KB and Developer Documentation.	2025-10-01 12:23:57.029057
ce9e81cd-6b89-4bf7-98e8-84ecdce6fbd2	7a8dcb22-28b7-4c2d-934e-d4d4294e3c05	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Vibe-code Dashboard	2025-10-01 12:31:09.523912
82b2ad90-d3a0-4d49-85cb-6990469acbbf	7a8dcb22-28b7-4c2d-934e-d4d4294e3c05	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	Self-service, even with short or more complex prompt, I want to be able to create a dashboard withs some charts showing my actual pricing data.	2025-10-01 12:31:09.728872
066712f3-0a17-492b-904f-94a401da3680	8cc49eab-ecf8-4121-9d49-0f1b9b9d3ee5	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Formula-to-text Description 	2025-10-01 21:21:54.648682
fa4d7d34-dc0f-4508-bf8f-ae0507a406ff	8cc49eab-ecf8-4121-9d49-0f1b9b9d3ee5	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a formula manager, I want to convert blockly formulas into human-readable descriptions, so that I can review and communicate complex pricing logic more easily within Pricefx.\nAs a sales representative, I want to have a readily available description of the formula which I can communicate with my customer as part of my agreement process.	2025-10-01 21:21:54.951334
5c861a13-0e04-420b-864a-e88a24d5fbe9	1b506209-c024-4556-83db-c304c1b42d61	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Issues investigator agent	2025-10-02 09:32:31.2695
324a01f9-0f84-4fa6-abb7-ae689dcceaeb	1b506209-c024-4556-83db-c304c1b42d61	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As an engineer in charge of investigating an issue on a partition, I want to provide a textual description (and potentially a screenshot) of the issue and get an analysis of the current deployment state and logs of the involved services (core, assistant, agent-gen…) to faster identify the root cause of the issue.	2025-10-02 09:32:31.498302
8529234d-c6ff-414c-a0a4-061dde0be611	b1fe48d4-84d0-43cc-8e40-d9feb89e29a8	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Generate context links	2025-10-02 11:18:47.796653
fce93452-d56a-4358-a48d-7329c30fafa2	b1fe48d4-84d0-43cc-8e40-d9feb89e29a8	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	Copilot could be able to generate context links for users. For example something like "generate a link to this quote for my manager that automatically approves the quote"	2025-10-02 11:18:48.020753
250c7f02-c45b-41fa-94b4-a30d62588853	20f56c9f-e97e-4cff-8bc0-a752fc26a12d	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Improve automatically generated IntegrationManager documentation	2025-10-02 11:47:04.907554
d87f608a-9686-491b-851c-c3d852c10afc	20f56c9f-e97e-4cff-8bc0-a752fc26a12d	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a PfM user using Integrations, I want to have an automatically generated, human-readable documentation of that integration so that I can quickly understand what the integration is doing without the need to check all routes and other items.\n\nThere's already an existing Documentation tab in the Integration Overview, but the content could be improved using the current AI capabilities.	2025-10-02 11:47:05.112338
af93de9e-b5ed-43e6-b6fe-6dfb86ce886b	9a6806d6-5e98-4e7a-a17a-38b607646fac	a5601f77-99af-4cb5-88a8-19ebbdabd2db	Contextual help in PlatformManager	2025-10-02 12:17:55.13106
3870b5cf-b7ff-4f98-9b91-8896a3d39fa2	9a6806d6-5e98-4e7a-a17a-38b607646fac	f61ee523-7b02-46bb-8c8d-54c78e18b1b1	As a PfM user, I want to be able to quickly open the section of the documentation/knowledge base related to the page I'm currently on so that I don't have to manually search the documentation.	2025-10-02 12:17:55.453571
\.


--
-- Data for Name: ideas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ideas (id, name, title, description, component, tag, type, created_at, total_votes) FROM stdin;
507b2bcd-db87-42e5-a072-a99ab499238c	Patrik Vlnas			quotes	mcp	solution	2025-10-01 06:32:30.092516	0
a337bddc-d359-4c92-86dc-adc214a0c8a5	Patrik Vlnas			copilot	mcp, copilot	idea	2025-10-01 06:31:04.908393	0
920262c4-a8e2-4203-93b5-11c1a3451311	Patrik Vlnas			admin_section	JSON	ai_problem	2025-10-01 06:30:18.823836	0
f470220a-2b01-42dd-a5e6-2b71a6cb45c4	Gabriel Smith			agents	Integrations	idea	2025-10-01 08:02:40.392018	0
eb2b0700-a998-4241-9fab-237a529aa1d5	Raúl Calvo Martín 			agents	JSON	idea	2025-10-01 08:03:09.148955	0
38f606da-f121-433f-9a4b-07a920f2d444	Johan Gustavsson 			quotes	LLM, JSON, UX	ai_problem	2025-10-01 08:03:34.506362	0
0b66cdd5-3799-4d02-9d66-9c9f7e209698	Johan Gustavsson 			price_management		ai_problem	2025-10-01 08:05:41.113106	0
17a12740-38be-4018-b8b5-aed7858bb117	Sylvain Rougemaille			agents	copilot, mcp	idea	2025-10-01 08:44:08.302304	0
405efc78-e88e-47d3-883e-d3f0d24d9b85	Peter			copilot	copilot	ai_problem	2025-10-01 11:08:47.800011	0
fe8c54f4-59ae-4452-90c5-7037067d92e4	Patrik Vlnas			copilot	metadata, QAPI, copilot, mcp	ai_problem	2025-10-01 12:23:56.587319	0
b048282f-5bde-46ec-b995-e979da3edaab	Sylvain Rougemaille			agents	mcp, copilot	idea	2025-10-01 09:02:12.629305	1
7a8dcb22-28b7-4c2d-934e-d4d4294e3c05	Patrik Vlnas			dashboard	charts, copilot, queries, metadata	idea	2025-10-01 12:31:09.294416	0
8cc49eab-ecf8-4121-9d49-0f1b9b9d3ee5	Johan Gustavsson 			accelerator	LLM, copilot, JSON	ai_problem	2025-10-01 21:21:54.286968	0
1b506209-c024-4556-83db-c304c1b42d61	Thomas Sontheimer			platform_manager		idea	2025-10-02 09:32:30.807081	0
20f56c9f-e97e-4cff-8bc0-a752fc26a12d	Radek Theier			platform_manager	Integrations	idea	2025-10-02 11:47:04.54618	0
9a6806d6-5e98-4e7a-a17a-38b607646fac	Radek Theier			platform_manager	copilot, Documentation	idea	2025-10-02 12:17:54.830992	0
d7d1be82-baff-4e01-a227-4c2f50dd07cf	Justin Childs 					idea	2025-10-01 08:01:33.835592	2
b1fe48d4-84d0-43cc-8e40-d9feb89e29a8	Martin Rejka			copilot	context link	idea	2025-10-02 11:18:47.589572	1
\.


--
-- Data for Name: kanban_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kanban_categories (id, key, title, color, "order", is_active, created_at, updated_at) FROM stdin;
4ef92277-f22d-4e1a-b136-8916951861c0	idea	AI Idea	#fdffad	1	true	2025-09-25 08:11:43.50492	2025-09-25 08:11:43.50492
361ea240-fb4b-4e2f-9a10-99799a8f9fdb	solution	AI Solution	#ffc6ff	2	true	2025-09-25 08:22:44.734343	2025-09-25 08:22:44.734343
d4b21152-fcbf-48b6-9c31-7df13b903988	ai_problem	AI Problem	#a3c4f3	0	true	2025-09-26 14:25:34.031971	2025-09-26 14:25:34.031971
\.


--
-- Data for Name: landing_page_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.landing_page_settings (id, mode, maintenance_message, countdown_message, summit_start_date, updated_at) FROM stdin;
\.


--
-- Data for Name: statistics_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.statistics_state (id, last_reset_at) FROM stdin;
c70b79ea-d91e-4cb4-ba98-65abb0e6252a	2025-10-01 06:25:55.938
\.


--
-- Data for Name: summit_home_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.summit_home_content (id, title, slug, content, is_published, created_at, updated_at) FROM stdin;
94f27773-32cd-488c-aac9-79aa7f451ac1	Welcome to P&E Summit 2025 in Prague!	home	<p>Welcome to the Product &amp; Engineering Summit! 🎉<br>This page gathers all the important information you need during your stay in Prague and at the office. Please take a few minutes to read through so you know what to expect, how to get around, and where to find what you need.</p><h2>🗓 Agenda</h2><ul><li><p><a class="text-primary underline" href="https://pricefx.atlassian.net/wiki/spaces/product/pages/6246301698/Product+Engineering+Summit+2025+-+September+30th+-+October+2nd#Agenda-(WIP)">https://pricefx.atlassian.net/wiki/spaces/product/pages/6246301698/Product+Engineering+Summit+2025+-+September+30th+-+October+2nd#Agenda-(WIP)</a></p></li><li><p>If you haven’t received it yet, you will soon.</p></li><li><p>🔥 Fireside Chat - you can submit your questions anonymously via <a class="text-primary underline" href="https://app.sli.do/event/uMT6TKxFD5NiGqaZ4cpP7V">LINK</a></p></li></ul><h2>🚆 Travel &amp; Arrival</h2><ul><li><p><strong>Arrivals &amp; Departures:</strong> Attendees can still update travel details directly on Confluence (<a class="text-primary underline" href="https://pricefx.atlassian.net/wiki/spaces/product/pages/6489604149/PES+2025+Hotel+Attendee+Confirmations?atlOrigin=eyJpIjoiOWZmMWYyMDE2Mzc2NDYxYjllNjQ0NDIyMmU1OWRiNDkiLCJwIjoiYyJ9">https://pricefx.atlassian.net/wiki/spaces/product/pages/6489604149/PES+2025+Hotel+Attendee+Confirmations?atlOrigin=eyJpIjoiOWZmMWYyMDE2Mzc2NDYxYjllNjQ0NDIyMmU1OWRiNDkiLCJwIjoiYyJ9</a> ) to help coordinate commute to the office with others. You can also check there your hotel stay.</p></li><li><p><strong>Public Transportation:</strong> We encourage everyone to use it. You’ll find guidance in Glean – Public Transport Guide.</p><ul><li><p>It’s often faster than a taxi, and even more fun if you team up with others — a nice little adventure and chance to bond.</p></li></ul></li><li><p><strong>Getting Lost?</strong> If needed, you can always grab a taxi or call some local people.</p></li></ul><h2>🏢 Office Orientation</h2><ul><li><p><strong>Building Access:</strong></p><ul><li><p>Everyone is pre-registered with the building → no entrance card or ID needed at reception.</p></li><li><p>On 3rd and 4th floors, doors will be kept open when possible. If closed, it’s for security reasons.</p></li><li><p>Limited entrance cards will be available around the floor → please return them after use for others.</p></li></ul></li><li><p><strong>Where to Find:</strong></p><ul><li><p>Toilets, storage, and key office areas will be marked on maps.</p></li><li><p>Hackathon seating: designated spots will be marked for each group.</p></li></ul></li><li><p><strong>Layout:</strong> Visual layout map will be attached for orientation.</p></li></ul><h2>☕ Office Basics</h2><ul><li><p>🥛 Put milk back in the fridge.</p></li><li><p>🧽 Clean up after yourself 🙏</p></li><li><p>🗑 Use the extra bins on the 3rd floor.</p></li><li><p>🚪 When leaving rooms, check for unnecessary mess.</p></li><li><p>🎉 After parties:</p><ul><li><p>Load/unload the dishwasher during the evening.</p></li><li><p>Collect empty bottles in one place.</p></li><li><p>Dispose of any broken glass safely.</p></li></ul></li></ul><p>All things Prague can be found here: <a class="text-primary underline" href="https://pricefx.atlassian.net/wiki/spaces/OP/pages/4001824828">https://pricefx.atlassian.net/wiki/spaces/OP/pages/4001824828</a> .</p><ul><li><p>Name Labels will be prepared for all registered participants on the 3rd floor</p></li><li><p>📸 Photographer on Wednesday → if you don’t want photos, let @Tereza Jarošová know.</p></li></ul><h2>🧑‍⚕️ Health &amp; Safety</h2><ul><li><p>If you feel unwell, please stay at your hotel.</p></li><li><p>COVID tests &amp; disinfectants available in the office.</p></li><li><p>Be mindful &amp; respectful of colleagues’ health.</p></li></ul><p><strong>Those who arrive earlier we have Health Days in person check ups in Prague:</strong> Monday &amp; Tuesday → check-ups available for early arrivals (link will be shared).</p><h2>💻 IT Support</h2><ul><li><p>IT will be available on-site and around the office during the summit</p></li></ul><p>✨ We’re excited to welcome you in Prague. Let’s make this summit productive, fun, and memorable! </p><p><strong>Pilsner Urquell</strong></p><ul><li><p>type: Lager</p></li><li><p>degrees: 11,8°</p></li><li><p>bitterness: 30,7 EBU / IBU</p></li><li><p>alc. volume: 4,4%</p></li><li><p><a class="text-primary underline" href="https://untappd.com/b/plzensky-prazdroj-pilsner-urquell/37936">https://untappd.com/b/plzensky-prazdroj-pilsner-urquell/37936</a></p></li></ul><p><strong>Benedict Klášterní / Kloster IPA</strong></p><ul><li><p>type: American IPA</p></li><li><p>degree: 15,5°</p></li><li><p>bitterness: 50 EBU / IBU</p></li><li><p>alc. volume: 6,5%</p></li><li><p><a class="text-primary underline" href="https://untappd.com/b/brevnovsky-klasterni-pivovar-sv-vojtecha-benedict-klasterni-ipa/240287">https://untappd.com/b/brevnovsky-klasterni-pivovar-sv-vojtecha-benedict-klasterni-ipa/240287</a></p></li></ul><p><strong>Nachmelená Opice / Hoppy Monkey</strong></p><ul><li><p>type: IPA</p></li><li><p>degree: 14,4°</p></li><li><p>bitterness: 50 EBU / IBU</p></li><li><p>alc. volume: 6%</p></li><li><p><a class="text-primary underline" href="https://untappd.com/b/nachmelena-opice-ipa-14/1412620">https://untappd.com/b/nachmelena-opice-ipa-14/1412620</a></p></li></ul><p><strong>Hák / Hook</strong></p><ul><li><p>type: Lager</p></li><li><p>degrees: 11,1°</p></li><li><p>bitterness: 45 EBU / IBU</p></li><li><p>alc. volume: 4,6%</p></li><li><p><a class="text-primary underline" href="https://untappd.com/b/hakuv-parni-pivovar-hak-11-deg/3012670">https://untappd.com/b/hakuv-parni-pivovar-hak-11-deg/3012670</a></p></li></ul><p><strong>Nachmelený / Hoppy Benedict</strong></p><ul><li><p>type: IPL</p></li><li><p>degree: 11,6°</p></li><li><p>bitterness: 40 EBU / IBU</p></li><li><p>alc. volume: 4,7%</p></li><li><p><a class="text-primary underline" href="https://untappd.com/b/brevnovsky-klasterni-pivovar-sv-vojtecha-nachmeleny-benedict/4278002">https://untappd.com/b/brevnovsky-klasterni-pivovar-sv-vojtecha-nachmeleny-benedict/4278002</a></p></li></ul><p><strong>Únětické pivo</strong></p><ul><li><p>type: lager</p></li><li><p>degree: 10,5°</p></li><li><p>bitterness: 34 EBU / IBU</p></li><li><p>alc. volume: 3,8%</p></li><li><p><a class="text-primary underline" href="https://untappd.com/b/uneticky-pivovar-uneticke-pivo-10-deg-nefiltrovane/202474">https://untappd.com/b/uneticky-pivovar-uneticke-pivo-10-deg-nefiltrovane/202474</a></p></li></ul><p></p>	true	2025-09-26 09:07:31.239348	2025-09-30 14:53:45.888
\.


--
-- Data for Name: summit_resources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.summit_resources (id, title, url, description, "order", is_active, created_at) FROM stdin;
4aa15724-2d53-4fd7-9730-0c9e5503638b	Wednesday Agenda	https://pricefx.atlassian.net/wiki/spaces/product/pages/6246301698/Product+Engineering+Summit+2025+-+September+30th+-+October+2nd#Wednesday-1st-October	What to expect, where to go and who to meet	2	true	2025-09-25 08:32:12.44615
5d506566-d62a-4e53-90ff-66cb7e16040a	Thursday Hackathon	https://pricefx.atlassian.net/wiki/spaces/product/pages/6500450306/Hackathon+PES+2025	Enjoy the whole day with your colleagues while experimenting, collaborating and sharing experiences.	3	true	2025-09-30 14:49:30.691514
68658cb5-a315-4dd5-bb13-7234a28e77cb	❗️PES 2025: Essential Information for Attendees in Prague	https://pricefx.atlassian.net/wiki/spaces/product/pages/6553239869/PES+2025+Essential+Information+for+Attendees+in+Prague	\N	3	true	2025-09-30 14:50:09.682117
a7b3b4b5-6d36-4116-ab36-4fb629ad800f	🍺Beer Menu	https://pricefx.atlassian.net/wiki/spaces/product/pages/6555467812/Product+Summit+2025+-+Beer+Menu	What's on tap on Wednesday evening?	4	true	2025-09-30 14:50:59.753611
2b656664-857a-419c-99e6-7683fd824314	Summit App Documentation	https://pricefx.atlassian.net/wiki/spaces/product/pages/6574768173/P+E+Summit+2025+Ideas+App+v0.0.1	\N	5	true	2025-10-01 06:33:34.311074
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- Data for Name: view_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.view_settings (id, default_view, show_board_by_default, updated_at) FROM stdin;
8c0a7dfe-0041-481a-a8c2-a8f081c3207c	board	true	2025-09-26 09:05:29.790037
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.votes (id, idea_id, session_id, vote_count, created_at, updated_at) FROM stdin;
e7990389-21c4-4e45-90bf-ca200914c417	d7d1be82-baff-4e01-a227-4c2f50dd07cf	b1e246d5-38a7-4b42-b06b-86bcb0f9f458	1	2025-10-01 12:28:15.868133	2025-10-01 12:28:15.868133
eb087096-ff09-4efb-b034-5afaadf9e53e	b048282f-5bde-46ec-b995-e979da3edaab	b1e246d5-38a7-4b42-b06b-86bcb0f9f458	1	2025-10-01 12:28:51.458964	2025-10-01 12:28:51.458964
bf3292af-e6f1-426d-8c35-ebe6b611e909	d7d1be82-baff-4e01-a227-4c2f50dd07cf	1d53e835-4133-42fe-838c-0b8766a34441	1	2025-10-02 12:18:39.796004	2025-10-02 12:18:39.796004
3bd06b3d-baca-449e-a07d-d6f3a8eb3b76	b1fe48d4-84d0-43cc-8e40-d9feb89e29a8	1d53e835-4133-42fe-838c-0b8766a34441	1	2025-10-02 12:18:52.482759	2025-10-02 12:18:52.482759
\.


--
-- Data for Name: voting_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voting_settings (id, is_open, max_votes_per_participant, started_at, closed_at, created_at, updated_at) FROM stdin;
a780afe7-f591-415e-8264-032c551d6c9c	true	5	2025-09-30 23:58:38.259	\N	2025-09-30 23:58:15.247949	2025-09-30 23:58:38.259
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: -
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 5, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: form_field_options form_field_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_field_options
    ADD CONSTRAINT form_field_options_pkey PRIMARY KEY (id);


--
-- Name: form_fields form_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_fields
    ADD CONSTRAINT form_fields_pkey PRIMARY KEY (id);


--
-- Name: header_settings header_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.header_settings
    ADD CONSTRAINT header_settings_pkey PRIMARY KEY (id);


--
-- Name: idea_dynamic_fields idea_dynamic_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_dynamic_fields
    ADD CONSTRAINT idea_dynamic_fields_pkey PRIMARY KEY (id);


--
-- Name: ideas ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_pkey PRIMARY KEY (id);


--
-- Name: kanban_categories kanban_categories_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kanban_categories
    ADD CONSTRAINT kanban_categories_key_unique UNIQUE (key);


--
-- Name: kanban_categories kanban_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kanban_categories
    ADD CONSTRAINT kanban_categories_pkey PRIMARY KEY (id);


--
-- Name: landing_page_settings landing_page_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_settings
    ADD CONSTRAINT landing_page_settings_pkey PRIMARY KEY (id);


--
-- Name: statistics_state statistics_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statistics_state
    ADD CONSTRAINT statistics_state_pkey PRIMARY KEY (id);


--
-- Name: summit_home_content summit_home_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_home_content
    ADD CONSTRAINT summit_home_content_pkey PRIMARY KEY (id);


--
-- Name: summit_home_content summit_home_content_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_home_content
    ADD CONSTRAINT summit_home_content_slug_unique UNIQUE (slug);


--
-- Name: summit_resources summit_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.summit_resources
    ADD CONSTRAINT summit_resources_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: view_settings view_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.view_settings
    ADD CONSTRAINT view_settings_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: voting_settings voting_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voting_settings
    ADD CONSTRAINT voting_settings_pkey PRIMARY KEY (id);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: -
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- PostgreSQL database dump complete
--

