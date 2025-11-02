/**
 * MSW Node Setup
 * Setup Mock Service Worker for Node/Jest testing
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
