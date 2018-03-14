SET default_transaction_read_only = off;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

CREATE ROLE dbowner WITH SUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE dblogin WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'dblogin';
CREATE DATABASE arm_db WITH TEMPLATE = template0 OWNER = dbowner;
\connect arm_db

SET default_transaction_read_only = off;
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;

CREATE TABLE sourceconfig (
    id integer NOT NULL,
    source text,
    config jsonb,
    disabled boolean
);

CREATE TABLE finderregistry (
    id integer NOT NULL,
    uuid text,
    registertime timestamp  with time zone,
    status integer
);

CREATE TABLE sourcetofinder (
    id integer NOT NULL,
    finderid integer,
    sourceid integer,
    createtime timestamp  with time zone
);

CREATE TABLE findercheckin (
    id integer NOT NULL,
    uuid text,
    checkintime timestamp with time zone
);

create table finderjobhistory (
  id integer NOT NULL,
  uuid text,
  starttime timestamp with time zone,
  finishtime timestamp with time zone
);

CREATE TABLE ingress (
    id integer NOT NULL,
    title text,
    description text,
    url text,
    image text,
    createdate timestamp with time zone,
    domain text,
    author text,
    keywords text
);

ALTER TABLE sourceconfig OWNER TO dbowner;
CREATE SEQUENCE sourceconfig_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE sourceconfig_id_seq OWNER TO dbowner;
ALTER SEQUENCE sourceconfig_id_seq OWNED BY sourceconfig.id;
ALTER TABLE ONLY sourceconfig ALTER COLUMN id SET DEFAULT nextval('sourceconfig_id_seq'::regclass);
ALTER TABLE ONLY sourceconfig ADD CONSTRAINT sourceconfig_pkey PRIMARY KEY (id);
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE sourceconfig TO dblogin;
GRANT SELECT,USAGE ON SEQUENCE sourceconfig_id_seq TO dblogin;
GRANT ALL ON TABLE sourceconfig TO dbowner;
GRANT ALL ON SEQUENCE sourceconfig_id_seq TO dbowner;
create index sourceconfig_idx_1 on sourceconfig (id);

ALTER TABLE finderregistry OWNER TO dbowner;
CREATE SEQUENCE finderregistry_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE finderregistry_id_seq OWNER TO dbowner;
ALTER SEQUENCE finderregistry_id_seq OWNED BY finderregistry.id;
ALTER TABLE ONLY finderregistry ALTER COLUMN id SET DEFAULT nextval('finderregistry_id_seq'::regclass);
ALTER TABLE ONLY finderregistry ADD CONSTRAINT finderregistry_pkey PRIMARY KEY (id);
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE finderregistry TO dblogin;
GRANT SELECT,USAGE ON SEQUENCE finderregistry_id_seq TO dblogin;
GRANT ALL ON TABLE finderregistry TO dbowner;
GRANT ALL ON SEQUENCE finderregistry_id_seq TO dbowner;
create index finderregistry_idx_1 on finderregistry (id);
create index finderregistry_idx_2 on finderregistry (uuid);

ALTER TABLE sourcetofinder OWNER TO dbowner;
CREATE SEQUENCE sourcetofinder_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE sourcetofinder_id_seq OWNER TO dbowner;
ALTER SEQUENCE sourcetofinder_id_seq OWNED BY sourcetofinder.id;
ALTER TABLE ONLY sourcetofinder ALTER COLUMN id SET DEFAULT nextval('sourcetofinder_id_seq'::regclass);
ALTER TABLE ONLY sourcetofinder ADD CONSTRAINT sourcetofinder_pkey PRIMARY KEY (id);
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE sourcetofinder TO dblogin;
GRANT SELECT,USAGE ON SEQUENCE sourcetofinder_id_seq TO dblogin;
GRANT ALL ON TABLE sourcetofinder TO dbowner;
GRANT ALL ON SEQUENCE sourcetofinder_id_seq TO dbowner;
create index sourcetofinder_idx_1 on sourcetofinder (id);

ALTER TABLE findercheckin OWNER TO dbowner;
CREATE SEQUENCE findercheckin_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE findercheckin_id_seq OWNER TO dbowner;
ALTER SEQUENCE findercheckin_id_seq OWNED BY findercheckin.id;
ALTER TABLE ONLY findercheckin ALTER COLUMN id SET DEFAULT nextval('findercheckin_id_seq'::regclass);
ALTER TABLE ONLY findercheckin ADD CONSTRAINT findercheckin_pkey PRIMARY KEY (id);
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE findercheckin TO dblogin;
GRANT SELECT,USAGE ON SEQUENCE findercheckin_id_seq TO dblogin;
GRANT ALL ON TABLE findercheckin TO dbowner;
GRANT ALL ON SEQUENCE findercheckin_id_seq TO dbowner;
create index findercheckin_idx_1 on findercheckin (id);
create index findercheckin_idx_2 on findercheckin (uuid, checkintime desc);

ALTER TABLE finderjobhistory OWNER TO dbowner;
CREATE SEQUENCE finderjobhistory_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE finderjobhistory_id_seq OWNER TO dbowner;
ALTER SEQUENCE finderjobhistory_id_seq OWNED BY findercheckin.id;
ALTER TABLE ONLY finderjobhistory ALTER COLUMN id SET DEFAULT nextval('finderjobhistory_id_seq'::regclass);
ALTER TABLE ONLY finderjobhistory ADD CONSTRAINT finderjobhistory_pkey PRIMARY KEY (id);
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE finderjobhistory TO dblogin;
GRANT SELECT,USAGE ON SEQUENCE finderjobhistory_id_seq TO dblogin;
GRANT ALL ON TABLE finderjobhistory TO dbowner;
GRANT ALL ON SEQUENCE finderjobhistory_id_seq TO dbowner;
create index finderjobhistory_idx_1 on finderjobhistory (id);

ALTER TABLE ingress OWNER TO dbowner;
CREATE SEQUENCE ingress_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE ingress_id_seq OWNER TO dbowner;
ALTER SEQUENCE ingress_id_seq OWNED BY ingress.id;
ALTER TABLE ONLY ingress ALTER COLUMN id SET DEFAULT nextval('ingress_id_seq'::regclass);
ALTER TABLE ONLY ingress ADD CONSTRAINT ingress_pkey PRIMARY KEY (id);
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE ingress TO dblogin;
GRANT SELECT,USAGE ON SEQUENCE ingress_id_seq TO dblogin;
GRANT ALL ON TABLE ingress TO dbowner;
GRANT ALL ON SEQUENCE ingress_id_seq TO dbowner;
create index ingress_idx_1 on ingress (id);
create index ingress_idx_2 on ingress (domain, url);
