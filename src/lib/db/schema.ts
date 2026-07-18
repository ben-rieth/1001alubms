import { sql } from 'drizzle-orm';
import * as t from 'drizzle-orm/pg-core';

// Business Logic Tables

export const albumTable = t.pgTable('album', {
    albumId: t.uuid('album_id').primaryKey().defaultRandom(),
    title: t.text('title').notNull().default(''),
    year: t.integer('year').notNull(),
    coverUrl: t.text('cover_url').notNull(),
    summary: t.text('summary').notNull(),
    genres: t
        .text('genres')
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
    styles: t
        .text('styles')
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
    wikipediaUrl: t.text('wikipedia_url').notNull(),
    appleMusicUrl: t.text('apple_music_url').notNull().default(''),
    spotifyId: t.text('spotify_id').notNull(),
    artistId: t
        .uuid('artist_id')
        .notNull()
        .references(() => artistTable.artistId),
    trackCount: t.integer('track_count').notNull(),
    runtimeMinutes: t.integer('runtime_minutes').notNull(),
    elevatorPitch: t.text('elevator_pitch').notNull().default(''),
    whyItsEssential: t.text('why_its_essential').notNull().default(''),
    accessibilityScore: t.integer('accessibility_score').notNull().default(1),
    accessibilityNote: t.text('accessibility_note').notNull().default(''),
    moods: t
        .text('moods')
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
});

export const artistTable = t.pgTable('artist', {
    artistId: t.uuid('artist_id').primaryKey().defaultRandom(),
    name: t.text('name').notNull(),
});

export const tracksTable = t.pgTable('track', {
    trackId: t.uuid('track_id').primaryKey().defaultRandom(),
    title: t.text('title').notNull(),
    durationSeconds: t.integer('duration_seconds').notNull(),
    trackNumber: t.integer('track_number').notNull(),
    albumId: t
        .uuid('album_id')
        .notNull()
        .references(() => albumTable.albumId),
});

// Auth Tables

export const user = t.pgTable('user', {
    id: t.text('id').primaryKey(),
    name: t.text('name').notNull(),
    email: t.varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: t.boolean('email_verified').notNull(),
    image: t.text('image'),
    createdAt: t
        .timestamp('created_at', { precision: 6, withTimezone: true })
        .notNull(),
    updatedAt: t
        .timestamp('updated_at', { precision: 6, withTimezone: true })
        .notNull(),
});

export const session = t.pgTable('session', {
    id: t.text('id').primaryKey(),
    userId: t
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    token: t.varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: t
        .timestamp('expires_at', { precision: 6, withTimezone: true })
        .notNull(),
    ipAddress: t.text('ip_address'),
    userAgent: t.text('user_agent'),
    createdAt: t
        .timestamp('created_at', { precision: 6, withTimezone: true })
        .notNull(),
    updatedAt: t
        .timestamp('updated_at', { precision: 6, withTimezone: true })
        .notNull(),
});

export const account = t.pgTable('account', {
    id: t.text('id').primaryKey(),
    userId: t
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accountId: t.text('account_id').notNull(),
    providerId: t.text('provider_id').notNull(),
    accessToken: t.text('access_token'),
    refreshToken: t.text('refresh_token'),
    accessTokenExpiresAt: t.timestamp('access_token_expires_at', {
        precision: 6,
        withTimezone: true,
    }),
    refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at', {
        precision: 6,
        withTimezone: true,
    }),
    scope: t.text('scope'),
    idToken: t.text('id_token'),
    password: t.text('password'),
    createdAt: t
        .timestamp('created_at', { precision: 6, withTimezone: true })
        .notNull(),
    updatedAt: t
        .timestamp('updated_at', { precision: 6, withTimezone: true })
        .notNull(),
});

export const verification = t.pgTable('verification', {
    id: t.text('id').primaryKey(),
    identifier: t.text('identifier').notNull(),
    value: t.text('value').notNull(),
    expiresAt: t
        .timestamp('expires_at', { precision: 6, withTimezone: true })
        .notNull(),
    createdAt: t
        .timestamp('created_at', { precision: 6, withTimezone: true })
        .notNull(),
    updatedAt: t
        .timestamp('updated_at', { precision: 6, withTimezone: true })
        .notNull(),
});
