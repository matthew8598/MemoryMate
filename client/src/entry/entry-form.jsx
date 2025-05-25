import React, { useState } from 'react';
import './entry-form.css';

const EntryForm = ({ onSubmit, onClose }) => { // Added onClose prop
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [reminder, setReminder] = useState('');
    const [reminderType, setReminderType] = useState('one-time'); // 'one-time' or 'interval'
    const [dueDate, setDueDate] = useState('');
    const [type, setType] = useState('journal');

const handleSubmit = (e) => {
    e.preventDefault();

    const entry = {
        type,
        content,
    };

    if (title.trim()) entry.title = title;
    if (reminder.trim()) {
        entry.reminder = reminder;
        // Do NOT add entry.interval; backend expects only 'reminder' property
    }
    if (type === 'task' && dueDate.trim()) entry.dueDate = dueDate;

    onSubmit(entry);

    setTitle('');
    setContent('');
    setReminder('');
    setDueDate('');
    setType('journal');
};

    return (
        <div className="entry-form-header">
            <h2>Create New Entry</h2>
            <button onClick={onClose} className="close-button">X</button> {/* Added close button */}
            <form onSubmit={handleSubmit} className="entry-form">
                <div>
                    <label htmlFor="type">Type:</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="journal">Journal</option>
                        <option value="task">Task</option>
                    </select>
                </div>
                {type === "journal" && (
                <div>
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                )}
                <div>
                    <label htmlFor="content">Content:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                {type === 'task' && (
                    <div>
                        <label htmlFor="dueDate">Due Date:</label>
                        <input
                            type="datetime-local"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="reminder">Reminder:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                                type="radio"
                                name="reminderType"
                                value="one-time"
                                checked={reminderType === 'one-time'}
                                onChange={() => { setReminderType('one-time'); setReminder(''); }}
                            />
                            One-time
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                                type="radio"
                                name="reminderType"
                                value="interval"
                                checked={reminderType === 'interval'}
                                onChange={() => { setReminderType('interval'); setReminder(''); }}
                            />
                            Interval
                        </label>
                        {reminderType === 'interval' && (
                            <span title="Enter intervals like '3 days', '2 hours', '15 minutes'. The reminder will repeat until turned off.">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginLeft: 4, color: '#4a90e2', cursor: 'pointer'}}>
                                    <circle cx="8" cy="8" r="8" fill="#eaf4fd"/>
                                    <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#4a90e2" fontFamily="Arial" fontWeight="bold">i</text>
                                </svg>
                            </span>
                        )}
                    </div>
                    {reminderType === 'one-time' ? (
                        <input
                            type="datetime-local"
                            id="reminder"
                            value={reminder}
                            onChange={(e) => setReminder(e.target.value)}
                        />
                    ) : (
                        <input
                            type="text"
                            id="reminder"
                            placeholder="e.g. 3 days, 2 hours"
                            value={reminder}
                            onChange={(e) => setReminder(e.target.value)}
                        />
                    )}
                </div>
                <button type="submit">Add Entry</button>
            </form>
        </div>
    );
};

export default EntryForm;