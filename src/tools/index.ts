import { searchTickets, getTicket, updateTicket } from './tickets.js';
import { createRecord } from './records.js';
import { createComment } from './comments.js';
import { searchCustomers, getCustomer } from './customers.js';
import { listLabels, listUsers } from './labels.js';

export const tools = [
  searchTickets,
  getTicket,
  updateTicket,
  createRecord,
  createComment,
  searchCustomers,
  getCustomer,
  listLabels,
  listUsers,
];
