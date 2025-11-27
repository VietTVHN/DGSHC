export interface SPRTRecord {
  id: string;
  model: string;
  serial: string;
  manufacturer: string;
  calibrationYear: number;
  r_tpw_current: number; // Ohm
  r_tpw_previous: number; // Ohm, optional or 0 if new
  w_ga: number; // >= 1.11807
  w_hg: number; // <= 0.844235
  timestamp: number;
}

export interface EvaluationResult {
  isPassGa: boolean;
  isPassHg: boolean;
  driftOhm: number;
  driftMK: number; // estimated
  status: 'PASS' | 'FAIL' | 'WARNING';
}

export interface AIAnalysisResponse {
  summary: string;
  recommendation: string;
  technicalDetails: string;
}
