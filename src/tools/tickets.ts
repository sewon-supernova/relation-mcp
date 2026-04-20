import { z } from 'zod';
import type { RelationClient } from '../client.js';
import { defineTool } from './define.js';

const MessageBoxOverride = z
  .number()
  .int()
  .positive()
  .optional()
  .describe('Override the default message_box_id for this call.');

const StatusCd = z
  .enum(['open', 'ongoing', 'closed', 'unwanted', 'trash', 'deleted', 'spam'])
  .describe('Ticket status code used by Re:lation.');

export const searchTickets = defineTool({
  name: 'search_tickets',
  title: 'Search Re:lation tickets',
  description:
    'Search tickets by status, label, assignee, date range, and free-text query. Returns a paginated list.',
  inputSchema: {
    message_box_id: MessageBoxOverride,
    status_cds: z.array(StatusCd).optional(),
    assignee_ids: z.array(z.number().int()).optional(),
    label_ids: z.array(z.number().int()).optional(),
    case_category_ids: z.array(z.number().int()).optional(),
    color_cds: z.array(z.string()).optional(),
    search_query: z
      .string()
      .optional()
      .describe('Free-text query matching subject or body.'),
    per_page: z.number().int().min(1).max(50).optional().default(10),
    page: z.number().int().min(1).optional().default(1),
  },
  handler: async (client: RelationClient, args) => {
    const { message_box_id, page, per_page, ...body } = args;
    return client.request({
      method: 'POST',
      messageBoxId: message_box_id,
      path: 'tickets/search',
      query: { page, per_page },
      body,
    });
  },
});

export const getTicket = defineTool({
  name: 'get_ticket',
  title: 'Get a single ticket',
  description: 'Fetch a single ticket by ticket_id, including all messages and metadata.',
  inputSchema: {
    message_box_id: MessageBoxOverride,
    ticket_id: z.number().int().positive().describe('Ticket ID to fetch.'),
  },
  handler: async (client: RelationClient, args) => {
    return client.request({
      method: 'GET',
      messageBoxId: args.message_box_id,
      path: `tickets/${args.ticket_id}`,
    });
  },
});

export const updateTicket = defineTool({
  name: 'update_ticket',
  title: 'Update a ticket',
  description:
    'Update ticket status, assignee, labels, color, or pending reason. Only provided fields are changed.',
  inputSchema: {
    message_box_id: MessageBoxOverride,
    ticket_id: z.number().int().positive(),
    status_cd: StatusCd.optional(),
    assignee_id: z
      .number()
      .int()
      .nullable()
      .optional()
      .describe('Pass null to unassign.'),
    label_ids: z.array(z.number().int()).optional(),
    color_cd: z.string().optional(),
    pending_reason_id: z.number().int().nullable().optional(),
  },
  handler: async (client: RelationClient, args) => {
    const { message_box_id, ticket_id, ...body } = args;
    return client.request({
      method: 'PUT',
      messageBoxId: message_box_id,
      path: `tickets/${ticket_id}`,
      body,
    });
  },
});
