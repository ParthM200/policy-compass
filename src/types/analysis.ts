export type Priority = "High" | "Medium" | "Low";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  effort: Priority;
  timeline: string;
  controls: string[];
}

export interface AnalysisData {
  overallScore: number;
  complianceLevel: "Excellent" | "Good" | "Fair" | "Poor" | "Critical" | string;
  summary: string;
  actionItems: ActionItem[];
}

export interface JiraTicket {
  jiraKey: string;
  jiraUrl: string;
  actionItem: ActionItem;
}

export interface JiraTicketError {
  actionItem: ActionItem;
  error: string;
}

export interface JiraResponse {
  success: boolean;
  data?: {
    createdTickets: JiraTicket[];
    errors: JiraTicketError[];
    totalCreated: number;
    totalErrors: number;
  };
  error?: string;
}
