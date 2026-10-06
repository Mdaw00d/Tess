import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

const dates = () => ({createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),updatedAt:timestamp('updated_at',{withTimezone:true}).defaultNow().notNull()});
export const user = pgTable('tess_user', {
  id:text('id').primaryKey(), name:text('name').notNull(), email:text('email').notNull().unique(),
  emailVerified:boolean('email_verified').default(false).notNull(), image:text('image'), ...dates(),
}).enableRLS();
export const session = pgTable('tess_session', {
  id:text('id').primaryKey(), token:text('token').notNull().unique(), expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
  userId:text('user_id').notNull().references(()=>user.id,{onDelete:'cascade'}), ipAddress:text('ip_address'), userAgent:text('user_agent'), ...dates(),
}, table=>[index('tess_session_user_idx').on(table.userId)]).enableRLS();
export const account = pgTable('tess_account', {
  id:text('id').primaryKey(), userId:text('user_id').notNull().references(()=>user.id,{onDelete:'cascade'}),
  accountId:text('account_id').notNull(), providerId:text('provider_id').notNull(),
  accessToken:text('access_token'),refreshToken:text('refresh_token'),idToken:text('id_token'),
  accessTokenExpiresAt:timestamp('access_token_expires_at',{withTimezone:true}),refreshTokenExpiresAt:timestamp('refresh_token_expires_at',{withTimezone:true}),
  scope:text('scope'),password:text('password'),...dates(),
},table=>[index('tess_account_user_idx').on(table.userId),uniqueIndex('tess_account_provider_unique').on(table.providerId,table.accountId)]).enableRLS();
export const verification = pgTable('tess_verification', {
  id:text('id').primaryKey(),identifier:text('identifier').notNull(),value:text('value').notNull(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),...dates(),
},table=>[index('tess_verification_identifier_idx').on(table.identifier)]).enableRLS();
