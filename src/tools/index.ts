import { searchTickets, getTicket, updateTicket } from './tickets.js';
import { createRecord } from './records.js';
import { createComment } from './comments.js';
import { searchCustomers, getCustomer } from './customers.js';
import { listLabels, listUsers } from './labels.js';
import { replyMail, listMailAccounts } from './mails.js';

export const tools = [
  searchTickets,
  getTicket,
  updateTicket,
  replyMail,
  listMailAccounts,
  createRecord,
  createComment,
  searchCustomers,
  getCustomer,
  listLabels,
  listUsers,
];
