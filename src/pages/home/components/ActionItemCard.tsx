import styles from "../Home.module.css";
import { ActionItem } from "../../../types/analysis";

interface ActionItemCardProps {
  item: ActionItem;
  index: number;
}

export default function ActionItemCard({ item, index }: ActionItemCardProps) {
  return (
    <div className={styles.actionItem}>
      <div className={styles.actionItemHeader}>
        <div className={styles.actionItemTitle}>
          <span className={styles.itemId}>
            {item.id || `AI-${(index + 1).toString().padStart(3, "0")}`}
          </span>
          <h5>{item.title || `Action Item ${index + 1}`}</h5>
        </div>
        <div className={styles.actionItemBadges}>
          <span className={`${styles.priorityBadge} ${styles[item.priority?.toLowerCase()] || styles.unknown}`}>
            {item.priority || "Unknown"}
          </span>
          <span className={`${styles.effortBadge} ${styles[item.effort?.toLowerCase()] || styles.unknown}`}>
            {item.effort || "Unknown"} Effort
          </span>
        </div>
      </div>

      <p className={styles.actionItemDescription}>
        {item.description || "No description provided"}
      </p>

      <div className={styles.actionItemFooter}>
        <div className={styles.timeline}>
          <strong>Timeline:</strong> {item.timeline || "TBD"}
        </div>

        {item.controls && item.controls.length > 0 && (
          <div className={styles.controls}>
            <strong>Controls:</strong>
            <div className={styles.controlTags}>
              {item.controls.map((control, cIndex) => (
                <span key={cIndex} className={styles.controlTag}>
                  {control}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
