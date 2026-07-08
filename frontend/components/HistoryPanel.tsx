"use client";

export interface HistoryItem {
  id: string;
  date: string;
  ailment: string;
  state: string;
  language: string;
  report: string;
  disclaimer: string;
}

export default function HistoryPanel({
  history,
  onView,
  onDelete,
}: {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="history-panel card">
      <h2 className="section-title">📜 Past Analyses</h2>
      {history.length === 0 ? (
        <p className="empty-msg">No past analyses yet. Run your first one below!</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-info">
                <span className="history-ailment">{item.ailment}</span>
                <span className="history-meta">{item.state} • {item.date}</span>
              </div>
              <div className="history-actions">
                <button onClick={() => onView(item)} className="btn-sm btn-teal">
                  View
                </button>
                <button onClick={() => onDelete(item.id)} className="btn-sm btn-red">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
