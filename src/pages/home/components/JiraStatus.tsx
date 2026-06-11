import styles from "../Home.module.css";
import { JiraResponse } from "../../../types/analysis";

interface JiraStatusProps {
  jiraResponse: JiraResponse;
  jiraError: string | null;
}

export default function JiraStatus({ jiraResponse, jiraError }: JiraStatusProps) {
  return (
    <div className={styles.jiraStatus}>
      {jiraResponse.success ? (
        <div className={styles.jiraSuccess}>
          <h5>✅ Jira Tickets Created Successfully!</h5>
          <p>
            Created {jiraResponse.data?.totalCreated} tickets.
            {(jiraResponse.data?.totalErrors || 0) > 0 &&
              ` ${jiraResponse.data?.totalErrors} failed.`}
          </p>
          {jiraResponse.data?.createdTickets && jiraResponse.data.createdTickets.length > 0 && (
            <div className={styles.jiraLinks}>
              <strong>Created Tickets:</strong>
              <ul>
                {jiraResponse.data.createdTickets.map((ticket, index) => (
                  <li key={index}>
                    <a
                      href={ticket.jiraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.jiraLink}
                    >
                      {ticket.jiraKey}: {ticket.actionItem.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.jiraError}>
          <h5>❌ Failed to Create Jira Tickets</h5>
          <p>{jiraError}</p>
        </div>
      )}
    </div>
  );
}
