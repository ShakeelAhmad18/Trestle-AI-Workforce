/**
 * Data Models and State Types for Trestle AI Workforce.
 */

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  tagline: string;
  avatar: string;
  color: string;
  model: string;
  skills: string[];
  description: string;
}

export interface FeatureRequirement {
  name: string;
  priority: string;
  description: string;
  market_demand_reason: string;
  monetization_potential: string;
}

export interface MarketResearchReport {
  project_domain: string;
  target_audience: string;
  core_value_proposition: string;
  demanded_features: FeatureRequirement[];
  recommended_tech_stack_rationale: string;
  security_and_compliance_needs: string[];
  source_citations: string[];
}

export interface ColumnDefinition {
  name: string;
  data_type: string;
  primary_key: boolean;
  nullable: boolean;
  unique: boolean;
  foreign_key?: string | null;
  default?: string | null;
  description?: string | null;
}

export interface TableDefinition {
  table_name: string;
  description: string;
  columns: ColumnDefinition[];
  indexes: string[];
}

export interface DatabaseSchema {
  database_engine: string;
  orm: string;
  tables: TableDefinition[];
  relationships_summary: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  request_body_schema?: string | null;
  response_schema: string;
  status_code: number;
  auth_required: boolean;
  rate_limit?: string | null;
}

export interface OpenAPISpec {
  title: string;
  version: string;
  base_prefix: string;
  auth_strategy: string;
  endpoints: APIEndpoint[];
}

export interface SystemArchitecture {
  project_name: string;
  tagline: string;
  tech_stack: Record<string, string>;
  clean_architecture_layers: Record<string, string>;
  database_schema: DatabaseSchema;
  api_specification: OpenAPISpec;
  security_controls: string[];
  directory_structure: string[];
}

export interface TestExecutionResult {
  passed: boolean;
  exit_code: number;
  stdout: string;
  stderr: string;
  test_count: number;
  failed_count: number;
  error_summary?: string | null;
}

export interface DeliveryInfo {
  repo_name: string;
  repo_url: string;
  is_private: boolean;
  commit_sha: string;
  files_delivered: string[];
  readme_content: string;
  handoff_email: string;
}

export interface ProjectHistoryItem {
  thread_id: string;
  prompt: string;
  status: string;
  current_step: string;
  file_count: number;
  test_passed: boolean;
  created_at: string;
  updated_at: string;
  has_delivery: boolean;
}

export interface WorkflowSessionState {
  threadId: string | null;
  prompt: string;
  status: 'idle' | 'running' | 'paused_for_approval' | 'testing' | 'fixing' | 'delivered' | 'failed';
  currentStep: string;
  autoApprove: boolean;
  researchReport: MarketResearchReport | null;
  architectureSpec: SystemArchitecture | null;
  generatedCodebase: Record<string, string>;
  testSuite: Record<string, string>;
  testResults: TestExecutionResult | null;
  deliveryInfo: DeliveryInfo | null;
  errorLogs: string[];
  retryCount: number;
  events: Array<{ node: string; update: any }>;
  isLoading: boolean;
  error: string | null;
}
