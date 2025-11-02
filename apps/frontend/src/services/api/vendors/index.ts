/**
 * Vendors Module Services
 * Centralized export for all vendors-related services
 */

import { vendorsService } from "./vendors.service";
import { purchaseOrdersService } from "./purchase-orders.service";
import { vendorPaymentsService } from "./payments.service";
import { grnsService } from "./grns.service";

export {
  vendorsService,
  purchaseOrdersService,
  vendorPaymentsService,
  grnsService,
};

export default {
  vendors: vendorsService,
  purchaseOrders: purchaseOrdersService,
  payments: vendorPaymentsService,
  grns: grnsService,
};
