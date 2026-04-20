import { z } from 'zod';
import type { RelationClient } from '../client.js';
import { defineTool } from './define.js';

export const searchCustomers = defineTool({
  name: 'search_customers',
  title: 'Search address book (顧客/アドレス帳)',
  description: 'Search customers in the address book by email, phone, name, or company.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
    emails: z.array(z.string().email()).optional(),
    tels: z.array(z.string()).optional(),
    last_name: z.string().optional(),
    first_name: z.string().optional(),
    company_name: z.string().optional(),
    per_page: z.number().int().min(1).max(50).optional().default(10),
    page: z.number().int().min(1).optional().default(1),
  },
  handler: async (client: RelationClient, args) => {
    const { message_box_id, page, per_page, ...body } = args;
    return client.request({
      method: 'POST',
      messageBoxId: message_box_id,
      path: 'customers/search',
      query: { page, per_page },
      body,
    });
  },
});

export const getCustomer = defineTool({
  name: 'get_customer',
  title: 'Get a customer',
  description: 'Fetch a single customer (address-book entry) by id.',
  inputSchema: {
    message_box_id: z.number().int().positive().optional(),
    customer_id: z.number().int().positive(),
  },
  handler: async (client: RelationClient, args) => {
    return client.request({
      method: 'GET',
      messageBoxId: args.message_box_id,
      path: `customers/${args.customer_id}`,
    });
  },
});
