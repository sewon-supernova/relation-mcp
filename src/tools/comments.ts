import { z } from 'zod';
import type { RelationClient } from '../client.js';
import { defineTool } from './define.js';

export const createComment = defineTool({
  name: 'create_comment',
  title: 'Create a team comment on a ticket',
  description:
    'Post a team comment to a ticket. Not visible to the customer — used for internal discussion.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
    ticket_id: z.number().int().positive(),
    operator_id: z.number().int().positive().optional(),
    body: z.string().min(1),
  },
  handler: async (client: RelationClient, args) => {
    const { message_box_id, ...body } = args;
    return client.request({
      method: 'POST',
      messageBoxId: message_box_id,
      path: 'comments',
      body,
    });
  },
});
