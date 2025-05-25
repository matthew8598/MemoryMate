

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
                      Reminder:  {content.reminder.split('T')[0]} {content.reminder.slice(11, 16)}
                    </div>
                  )}
                  {content.dueDate && (
                    <div className="list-item-footer">
                      Due at: {content.dueDate.slice(11, 16)}
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
                        await FetchHelper.reminder.update(content.id, null);
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