

import React, { useRef, useEffect } from 'react';
import FetchHelper from '../fetchHelper';
import './list-container.css';

const ListContainer = ({ data, onDelete, highlightId }) => {
  const entryRefs = useRef({});

  useEffect(() => {
    if (highlightId && entryRefs.current[highlightId]) {
      entryRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remove highlight after 2 seconds
      setTimeout(() => {
        if (entryRefs.current[highlightId]) {
          entryRefs.current[highlightId].classList.remove('highlight-entry');
        }
      }, 2000);
    }
  }, [highlightId, data]);

  return (
    <div className="list-container">
      {data.map((item, index) => (
        <div key={index} className="list-item">
          <div className="list-item-header">
            <div className="list-item-title">{item.title}</div>
          </div>
          <div className="list-item-content">
            {item.contents.map((content, idx) => {
              const isHighlight = highlightId && String(content.id) === String(highlightId);
              return (
                <div
                  key={idx}
                  className={`list-item-content-entry${isHighlight ? ' highlight-entry' : ''}`}
                  ref={el => {
                    if (isHighlight) entryRefs.current[highlightId] = el;
                  }}
                >
                  <div className="list-item-content-text">{content.content}</div>

                  {content.reminder && (
                    <div className="list-item-footer">
                      Reminder: {isNaN(Date.parse(content.reminder))
                        ? content.reminder // Show interval string as-is
                        : `${content.reminder.split('T')[0]}` // Show date/time if ISO
                      }
                    </div>
                  )}
                  {content.dueDate && (
                    <div className="list-item-footer">
                      Due at: {(() => {
                        const d = new Date(content.dueDate);
                        // Format as YYYY-MM-DD HH:mm (local time)
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        const hours = String(d.getHours()).padStart(2, '0');
                        const minutes = String(d.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day} ${hours}:${minutes}`;
                      })()}
                    </div>
                  )}

                  <button
                    className="delete-x-button"
                    onClick={async () => {
                      if (content.id) {
                        await FetchHelper.entry.delete(content.id);
                        window.location.reload();
                      } else {
                        console.error('Content ID is missing');
                      }
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                  {/* Turn off reminder button for interval reminders */}
                  {content.reminder && isNaN(Date.parse(content.reminder)) && (
                    <button
                      className="btn btn-sm btn-warning"
                      style={{marginTop: 4, alignSelf: 'flex-start'}}
                      onClick={async () => {
                        await FetchHelper.reminder.delete(content.id, null);
                        window.location.reload();
                      }}
                    >
                      Turn off reminder
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListContainer;