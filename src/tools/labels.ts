import { z } from 'zod';
import type { RelationClient } from '../client.js';
import { defineTool } from './define.js';

export const listLabels = defineTool({
  name: 'list_labels',
  title: 'List labels in a message box',
  description: 'List all labels configured for a message_box. Useful before calling update_ticket with label_ids.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
  },
  handler: async (client: RelationClient, args) => {
    return client.request({
      method: 'GET',
      messageBoxId: args.message_box_id,
      path: 'labels',
    });
  },
});

export const listUsers = defineTool({
  name: 'list_users',
  title: 'List operators (agents) for assignment',
  description: 'List operator users who can be assigned to tickets.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
  },
  handler: async (client: RelationClient, args) => {
    return client.request({
      method: 'GET',
      messageBoxId: args.message_box_id,
      path: 'users',
    });
  },
});
