import React from 'react';
import './list-container.css';

const ListContainer = ({ data, onEdit, onDelete }) => {
  return (
    console.log("ListContainer data:", data),
    <div className="list-container">
      {data.map((item, index) => (
        <div key={index} className="list-item">
          <div className="list-item-header">
            <div className="list-item-title">{item.title}</div>
          </div>
          <div className="list-item-content">
            {item.contents.map((content, idx) => (
              <div key={idx} className="list-item-content-entry">
                <div className="list-item-content-text">{content.content}</div>

                {content.reminder && (
                    <div className="list-item-footer">
                    Reminder: {content.reminder.split('T')[0]} {content.reminder.slice(11, 16)}
                    </div>
                )}

                <button
                    className="delete-x-button"
                    onClick={() => onDelete(item.id, content.id)} // Adjust as needed
                    title="Delete"
                >
                    ×
                </button>
                </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListContainer;