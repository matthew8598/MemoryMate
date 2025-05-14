import React from 'react';
import './list-container.css';


const ListContainer = ({ data, onDelete }) => {
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
                    onClick={() => {
                      console.log(content.id);
                      if (content.id) {
                        onDelete(content.id);
                      } else {
                        console.error('Content ID is missing');
                      }
                    }}
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