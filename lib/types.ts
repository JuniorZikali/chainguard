export interface Contract {
  id: string;
  name: string;
  source_code: string;
  benchmark_label: string | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  contract_id: string;
  llm_model: string;
  prompt_version: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  risk_score: number | null;
  summary: string | null;
  foundry_test_code: string | null;
  created_at: string;
  completed_at: string | null;
  contract?: Contract;
}

export interface Property {
  id: string;
  analysis_id: string;
  name: string;
  description: string;
  category: string | null;
}

export interface Finding {
  id: string;
  analysis_id: string;
  vulnerability_class: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  affected_function: string | null;
  affected_line: number | null;
  explanation: string;
  recommendation: string;
}

export interface AuditLog {
  id: string;
  contract_id: string;
  analysis_id: string;
  summary: string;
  risk_score: number | null;
  hash: string;
  prev_hash: string | null;
  created_at: string;
}

export interface AnalysisDetails {
  analysis: Analysis;
  contract: Contract;
  properties: Property[];
  findings: Finding[];
  logs: AuditLog[];
}
