import { z } from 'zod';
import type { RelationClient } from '../client.js';
import { defineTool } from './define.js';

/**
 * Customer-facing mail reply. This tool SENDS a real email to the customer
 * on the ticket. To prevent accidental sends (e.g. an LLM chaining calls),
 * callers must pass `confirm_send: true`.
 */
export const replyMail = defineTool({
  name: 'reply_mail',
  title: 'Reply to a ticket via email (CUSTOMER-FACING — sends real mail)',
  description: [
    'Send an email reply on a Re:lation ticket. The email goes directly to the customer.',
    '',
    'Safety: you MUST pass `confirm_send: true`. Without it the call is rejected. This guards against an agent accidentally firing a send during tool chaining.',
    '',
    'Flow:',
    '  1. Find the message to reply to (use `get_ticket` or `search_tickets` to find a message_id).',
    '  2. Find the mail_account_id to send from (use `list_mail_accounts`).',
    '  3. Call `reply_mail` with subject / body / to / status_cd / confirm_send.',
    '',
    'After a successful send the returned object contains the new message_id and ticket_id.',
  ].join('\n'),
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
    message_id: z
      .number()
      .int()
      .positive()
      .describe('ID of the customer message being replied to (from get_ticket / search_tickets).'),
    mail_account_id: z
      .number()
      .int()
      .positive()
      .describe('ID of the mail account to send from (see list_mail_accounts).'),
    to: z.string().min(1).describe('Recipient address. Typically the customer email.'),
    cc: z.string().optional(),
    bcc: z.string().optional(),
    subject: z
      .string()
      .min(1)
      .max(200)
      .describe('Subject. Usually prefixed "Re: " when replying.'),
    body: z.string().min(1).describe('Mail body.'),
    is_html: z.boolean().optional().default(false),
    status_cd: z
      .enum(['open', 'ongoing', 'closed', 'unwanted', 'trash', 'deleted', 'spam'])
      .describe('Ticket status to set after sending. Usually "closed" for resolved or "ongoing".'),
    pending_reason_id: z.number().int().positive().optional(),
    confirm_send: z
      .literal(true)
      .describe(
        'Must be literal boolean true. A safety interlock — if omitted or false the server refuses to send.',
      ),
  },
  handler: async (client: RelationClient, args) => {
    if (args.confirm_send !== true) {
      throw new Error(
        'reply_mail refused: confirm_send must be true. This tool sends a real email to the customer.',
      );
    }
    const { message_box_id, confirm_send: _confirm, ...body } = args;
    return client.request({
      method: 'POST',
      messageBoxId: message_box_id,
      path: 'mails/reply',
      body,
    });
  },
});

export const listMailAccounts = defineTool({
  name: 'list_mail_accounts',
  title: 'List configured mail accounts',
  description:
    'List the mail accounts (送信元) configured for a message_box. Use this to discover mail_account_id before calling reply_mail.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
  },
  handler: async (client: RelationClient, args) => {
    return client.request({
      method: 'GET',
      messageBoxId: args.message_box_id,
      path: 'mail_accounts',
    });
  },
});
