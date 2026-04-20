import { z } from 'zod';
import type { RelationClient } from '../client.js';
import { defineTool } from './define.js';

export const createRecord = defineTool({
  name: 'create_record',
  title: 'Create an internal record (応対メモ)',
  description:
    'Create an internal "応対メモ" on a ticket. Visible only to the support team; the end customer never sees it. Use this for triage notes, investigation context, or handoff messages.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
    ticket_id: z.number().int().positive(),
    operator_id: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Operator (agent) user_id to attribute the record to.'),
    subject: z.string().optional(),
    body: z.string().min(1).describe('Record body. Plain text.'),
    duration: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Handling duration in seconds, if tracked.'),
  },
  handler: async (client: RelationClient, args) => {
    const { message_box_id, ...body } = args;
    return client.request({
      method: 'POST',
      messageBoxId: message_box_id,
      path: 'records',
      body,
    });
  },
});
