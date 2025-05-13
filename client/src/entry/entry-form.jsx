import React, { useState } from 'react';
import './entry-form.css';

const EntryForm = ({ onSubmit, onClose }) => { // Added onClose prop
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [reminder, setReminder] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [type, setType] = useState('journal');

const handleSubmit = (e) => {
    e.preventDefault();

    const entry = {
        type,
        content,
    };

    if (title.trim()) entry.title = title;
    if (reminder.trim()) entry.reminder = reminder;
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
                    <input
                        type="text"
                        id="reminder"
                        value={reminder}
                        onChange={(e) => setReminder(e.target.value)}
                    />
                </div>
                <button type="submit">Add Entry</button>
            </form>
        </div>
    );
};

export default EntryForm;