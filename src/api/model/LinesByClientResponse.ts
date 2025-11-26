import type { Line } from "../../types/Line";

export interface LinesByClientResponse {
  lines: Line[];
  totalLines: number;
  totalLinesFiltered: number;
}

