/**
 * MSW Browser Setup
 * Setup Mock Service Worker for browser testing
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
