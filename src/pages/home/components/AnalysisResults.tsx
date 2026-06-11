import styles from "../Home.module.css";
import { GeminiAnalysis } from "../../../hooks/useGemini";
import { ActionItem, JiraResponse } from "../../../types/analysis";
import ActionItemCard from "./ActionItemCard";
import JiraStatus from "./JiraStatus";

interface AnalysisResultsProps {
  analysis: GeminiAnalysis;
  jiraResponse: JiraResponse | null;
  jiraError: string | null;
  jiraLoading: boolean;
  onPushToJira: (actionItems: ActionItem[]) => void;
}

export default function AnalysisResults({
  analysis,
  jiraResponse,
  jiraError,
  jiraLoading,
  onPushToJira,
}: AnalysisResultsProps) {
  const { response: data, timestamp } = analysis;
  const complianceClass = styles[data.complianceLevel?.toLowerCase()] || styles.unknown;

  return (
    <div className={styles.responseContainer}>
      <h3>Compliance Analysis Results</h3>

      <div className={styles.analysisDashboard}>
        <div className={styles.scoreSection}>
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreProgressBar}>
              <div className={styles.scoreProgressFill} style={{ width: `${data.overallScore}%` }}></div>
            </div>
            <div className={styles.scoreNumber}>{data.overallScore}/100</div>
            <div className={`${styles.complianceLevel} ${complianceClass}`}>
              {data.complianceLevel} Compliance
            </div>
            <p className={styles.summary}>{data.summary}</p>
          </div>
        </div>

        {data.actionItems && data.actionItems.length > 0 && (
          <div className={styles.actionItemsSection}>
            <div className={styles.actionItemsHeader}>
              <h4 className={styles.sectionTitle}>Action Items ({data.actionItems.length})</h4>
              <button
                className={styles.jiraButton}
                onClick={() => onPushToJira(data.actionItems)}
                disabled={jiraLoading}
              >
                {jiraLoading ? "Creating Tickets..." : "Push to Jira"}
              </button>
            </div>
            <div className={styles.actionItemsList}>
              {data.actionItems.map((item, index) => (
                <ActionItemCard key={item.id || index} item={item} index={index} />
              ))}
            </div>
          </div>
        )}

        {jiraResponse && <JiraStatus jiraResponse={jiraResponse} jiraError={jiraError} />}
      </div>

      <p className={styles.timestamp}>Generated: {new Date(timestamp).toLocaleString()}</p>
    </div>
  );
}
