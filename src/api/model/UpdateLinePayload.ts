import type { CreateLinePayload } from "./CreateLinePayload";

export interface UpdateLinePayload extends CreateLinePayload {
  id: number;
}

