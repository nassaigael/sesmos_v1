--
-- PostgreSQL database dump
--

\restrict fh2ngT92jHD76b7jLrPaUGJ0deWOzhEWDFIGDe1521bBuOW070iu1eOLoy8TvNB

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_mentions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_mentions (
    id character varying(255) NOT NULL,
    entity_id character varying(255),
    entity_name character varying(255),
    entity_type character varying(255),
    user_id character varying(255),
    message_id character varying(255) NOT NULL
);


ALTER TABLE public.chat_mentions OWNER TO postgres;

--
-- Name: chat_message_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message_attachments (
    message_id character varying(255) NOT NULL,
    file_name character varying(255),
    file_size bigint,
    file_type character varying(255),
    file_url character varying(255),
    id character varying(255)
);


ALTER TABLE public.chat_message_attachments OWNER TO postgres;

--
-- Name: chat_message_deleted_for_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message_deleted_for_users (
    message_id character varying(255) NOT NULL,
    user_id character varying(255)
);


ALTER TABLE public.chat_message_deleted_for_users OWNER TO postgres;

--
-- Name: chat_message_reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message_reactions (
    message_id character varying(255) NOT NULL,
    type character varying(255),
    user_id character varying(255),
    user_name character varying(255)
);


ALTER TABLE public.chat_message_reactions OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    deleted_for_everyone boolean NOT NULL,
    edited boolean NOT NULL,
    room_id character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: chat_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_rooms (
    id character varying(255) NOT NULL,
    active boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    name character varying(255) NOT NULL,
    participant_ids text,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.chat_rooms OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id character varying(255) NOT NULL,
    active boolean NOT NULL,
    address text,
    company_name character varying(255) NOT NULL,
    contact_name character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(255) NOT NULL,
    logo_url text,
    phone character varying(255) NOT NULL,
    tax_id character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    vat_number character varying(255) NOT NULL
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    image_url character varying(255),
    name character varying(255) NOT NULL,
    serial_number character varying(255),
    status character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    client_id character varying(255),
    product_id character varying(255),
    region_id character varying(255),
    CONSTRAINT equipment_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'MAINTENANCE'::character varying, 'DOWN'::character varying])::text[])))
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance (
    id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(255),
    end_date timestamp(6) without time zone,
    start_date timestamp(6) without time zone,
    status character varying(255) NOT NULL,
    type character varying(255),
    client_id character varying(255),
    equipment_id character varying(255) NOT NULL,
    technician_id character varying(255),
    CONSTRAINT maintenance_status_check CHECK (((status)::text = ANY ((ARRAY['PLANIFIE'::character varying, 'EN_COURS'::character varying, 'TERMINE'::character varying, 'ANNULE'::character varying])::text[])))
);


ALTER TABLE public.maintenance OWNER TO postgres;

--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenances (
    id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text NOT NULL,
    end_date timestamp(6) without time zone,
    scheduled_date timestamp(6) without time zone,
    start_date timestamp(6) without time zone,
    status character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    client_id character varying(255),
    equipment_id character varying(255) NOT NULL,
    technician_id character varying(255),
    CONSTRAINT maintenances_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT maintenances_type_check CHECK (((type)::text = ANY ((ARRAY['PREVENTIVE'::character varying, 'CORRECTIVE'::character varying, 'URGENT'::character varying])::text[])))
);


ALTER TABLE public.maintenances OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone,
    is_read boolean NOT NULL,
    message character varying(255),
    metadata character varying(255),
    redirect_url character varying(255),
    type character varying(255),
    user_id character varying(255),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['SALE_ALERT'::character varying, 'EQUIPMENT_DOWN'::character varying, 'STOCK_CRITICAL'::character varying, 'MAINTENANCE_UPDATE'::character varying, 'INFO'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    image_url text,
    name character varying(255) NOT NULL,
    price double precision NOT NULL,
    CONSTRAINT products_category_check CHECK (((category)::text = ANY ((ARRAY['CONSTRUCTION'::character varying, 'ELECTRICITY'::character varying, 'PLUMBING'::character varying, 'TOOLS'::character varying, 'INDUSTRIAL'::character varying, 'AGRICULTURAL'::character varying, 'SPARE_PARTS'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id character varying(255) NOT NULL,
    country character varying(100),
    latitude double precision,
    longitude double precision,
    name character varying(255) NOT NULL
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id character varying(255) NOT NULL,
    date timestamp(6) without time zone NOT NULL,
    quantity integer NOT NULL,
    total_price double precision NOT NULL,
    unit_price double precision NOT NULL,
    client_id character varying(255),
    product_id character varying(255) NOT NULL,
    region_id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    threshold integer NOT NULL,
    updated_at timestamp(6) without time zone,
    product_id character varying(255)
);


ALTER TABLE public.stock OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(255) NOT NULL,
    account_non_locked boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    email text NOT NULL,
    failed_attempts integer NOT NULL,
    image_url text,
    lock_time timestamp(6) without time zone,
    name text NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    client_id character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'MANAGER'::character varying, 'TECHNICIAN'::character varying, 'CLIENT'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: chat_mentions chat_mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_mentions
    ADD CONSTRAINT chat_mentions_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_rooms chat_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: clients idx_clients_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT idx_clients_email UNIQUE (email);


--
-- Name: users idx_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT idx_users_email UNIQUE (email);


--
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (id);


--
-- Name: maintenances maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: regions uk1m9qnhbk56c8iskxvfupln9me; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT uk1m9qnhbk56c8iskxvfupln9me UNIQUE (name);


--
-- Name: equipment ukagm98wn5ln6uoh6o9hx25ogic; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT ukagm98wn5ln6uoh6o9hx25ogic UNIQUE (serial_number);


--
-- Name: stock ukkhabtqwr86p7x9mt2krib98tx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT ukkhabtqwr86p7x9mt2krib98tx UNIQUE (product_id);


--
-- Name: products uko61fmio5yukmmiqgnxf8pnavn; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT uko61fmio5yukmmiqgnxf8pnavn UNIQUE (name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_chat_room_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_room_name ON public.chat_rooms USING btree (name);


--
-- Name: idx_chat_room_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_room_type ON public.chat_rooms USING btree (type);


--
-- Name: idx_clients_company_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_company_name ON public.clients USING btree (company_name);


--
-- Name: idx_clients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clients_phone ON public.clients USING btree (phone);


--
-- Name: idx_mention_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mention_entity ON public.chat_mentions USING btree (entity_type, entity_id);


--
-- Name: idx_mention_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mention_message_id ON public.chat_mentions USING btree (message_id);


--
-- Name: idx_mention_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mention_user_id ON public.chat_mentions USING btree (user_id);


--
-- Name: idx_sales_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_date ON public.sales USING btree (date);


--
-- Name: idx_sales_date_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_date_product ON public.sales USING btree (date, product_id);


--
-- Name: idx_sales_date_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_date_user ON public.sales USING btree (date, user_id);


--
-- Name: idx_sales_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_product_id ON public.sales USING btree (product_id);


--
-- Name: idx_sales_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_region_id ON public.sales USING btree (region_id);


--
-- Name: idx_sales_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);


--
-- Name: idx_users_account_non_locked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_account_non_locked ON public.users USING btree (account_non_locked);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_name ON public.users USING btree (name);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_role_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_status ON public.users USING btree (role, account_non_locked);


--
-- Name: sales fk5bgaw8g0rrbqdvafq36g58smk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fk5bgaw8g0rrbqdvafq36g58smk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: chat_message_reactions fk5r5vgdnjj6k6ivkdokg4yqrpv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_reactions
    ADD CONSTRAINT fk5r5vgdnjj6k6ivkdokg4yqrpv FOREIGN KEY (message_id) REFERENCES public.chat_messages(id);


--
-- Name: chat_messages fk6f0y4l43ihmgfswkgy9yrtjkh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk6f0y4l43ihmgfswkgy9yrtjkh FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications fk9y21adhxn0ayjhfocscqox7bh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk9y21adhxn0ayjhfocscqox7bh FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: equipment fkav5juknfpminmqc66sj0hiauo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT fkav5juknfpminmqc66sj0hiauo FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: sales fkbbif9cb3ecyusyms54yvwlhd5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fkbbif9cb3ecyusyms54yvwlhd5 FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: maintenances fkclal38b8d0ipvvr2r166qtxl; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT fkclal38b8d0ipvvr2r166qtxl FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: equipment fkcriai4u2254gn8t8egoqsn64p; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT fkcriai4u2254gn8t8egoqsn64p FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock fkeuiihog7wq4cu7nvqu7jx57d2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT fkeuiihog7wq4cu7nvqu7jx57d2 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: equipment fkgfohfvi4vjo614hjeoqwhk1b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT fkgfohfvi4vjo614hjeoqwhk1b2 FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: chat_message_attachments fkhl88m5ft7rcbu5lrbmdj8clck; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_attachments
    ADD CONSTRAINT fkhl88m5ft7rcbu5lrbmdj8clck FOREIGN KEY (message_id) REFERENCES public.chat_messages(id);


--
-- Name: chat_mentions fkiiwyj5mimfhc7lw54pe5m2whp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_mentions
    ADD CONSTRAINT fkiiwyj5mimfhc7lw54pe5m2whp FOREIGN KEY (message_id) REFERENCES public.chat_messages(id);


--
-- Name: sales fkkxc13g7l4ioljxqyoo15nh051; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fkkxc13g7l4ioljxqyoo15nh051 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sales fkmy8655acgqh84ur1xwsa1p87x; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fkmy8655acgqh84ur1xwsa1p87x FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: maintenances fko98g5diy1n1a432y06ethsamh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT fko98g5diy1n1a432y06ethsamh FOREIGN KEY (technician_id) REFERENCES public.users(id);


--
-- Name: maintenances fkpgadt8tnp500jih3t0w9dvhn3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT fkpgadt8tnp500jih3t0w9dvhn3 FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: users fkqvykjc6027qa8n5es37omu3xs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkqvykjc6027qa8n5es37omu3xs FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: chat_message_deleted_for_users fkt907o8ykgekvb4qkb6pkphy9i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_deleted_for_users
    ADD CONSTRAINT fkt907o8ykgekvb4qkb6pkphy9i FOREIGN KEY (message_id) REFERENCES public.chat_messages(id);


--
-- PostgreSQL database dump complete
--

\unrestrict fh2ngT92jHD76b7jLrPaUGJ0deWOzhEWDFIGDe1521bBuOW070iu1eOLoy8TvNB

