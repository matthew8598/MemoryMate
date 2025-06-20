

import React, { useEffect, useState, useRef } from 'react';
import '../assets/bootstrap/css/bootstrap.min.css';
import '../assets/bootstrap/css/bootstrap-grid.min.css';
import '../assets/bootstrap/css/bootstrap-reboot.min.css';
import '../assets/dropdown/css/style.css';
import '../assets/theme/css/style.css';
import '../assets/mobirise/css/mbr-additional.css';
import IMAGE_logo from '../assets/images/dashboard.svg';
import '../assets/smoothscroll/smooth-scroll.js';
import '../assets/ytplayer/index.js';
import '../assets/dropdown/js/navbar-dropdown.js';
import '../assets/theme/js/script.js';
import FetchHelper from '../fetchHelper';
import ListContainer from '../list/list-container';
import EntryForm from '../entry/entry-form';
import './Dashboard.css';
import './postpone-form.css';

// Listen for navigation messages from the service worker
if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'navigate' && event.data.url) {
      // Only navigate if the URL is different
      if (window.location.pathname + window.location.search !== event.data.url) {
        window.history.replaceState({}, '', event.data.url);
        // Optionally, you can trigger a reload or state update if needed
        window.dispatchEvent(new Event('popstate'));
      }
    }
  });
}

// For query params
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}


const POSTPONE_OPTIONS = [
  { label: '1 hour', value: 1 * 60 * 60 * 1000 },
  { label: '1 day', value: 24 * 60 * 60 * 1000 },
  { label: '3 days', value: 3 * 24 * 60 * 60 * 1000 },
  { label: '1 week', value: 7 * 24 * 60 * 60 * 1000 },
];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [showPostpone, setShowPostpone] = useState(false);
  const [postponeId, setPostponeId] = useState(null);


  useEffect(() => {
    // Check for highlight or postpone in query params
    const entry = getQueryParam('entry');
    const postpone = getQueryParam('postpone');
    if (entry) setHighlightId(entry);
    if (postpone) {
      setShowPostpone(true);
      setPostponeId(postpone);
    }

    // Fetch entries from the dashboard route
    FetchHelper.list.getDashboard()
      .then(response => {
        if (response.ok) {
          const data = response.data;
          setTasks(data.tasks);
          setJournals(data.journals);
        } else {
          console.error('Failed to fetch dashboard data');
        }
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);
  // Postpone logic
  const handlePostpone = async (intervalMs) => {
    if (!postponeId) return;
    // Find the task's current due date
    let entry = null;
    for (const list of tasks) {
      for (const item of list.contents) {
        if (String(item.id) === String(postponeId)) {
          entry = item;
          break;
        }
      }
    }
    if (!entry || !entry.dueDate) {
      alert('Task not found or missing due date.');
      setShowPostpone(false);
      setPostponeId(null);
      return;
    }
    const newDate = new Date(new Date(entry.dueDate).getTime() + intervalMs).toISOString();
    console.log(`Postponing task ${postponeId} by ${intervalMs} ms to new date: ${newDate}`);
    await FetchHelper.reminder.postpone(postponeId, newDate);
    setShowPostpone(false);
    setPostponeId(null);
    // Remove ?postpone from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Refresh dashboard
    FetchHelper.list.getDashboard().then(response => {
      if (response.ok) {
        setTasks(response.data.tasks);
        setJournals(response.data.journals);
      }
    });
  };

const handleCreateEntry = async (entry) => {
  try {
    const response = await FetchHelper.entry.create(entry);
    if (response.ok) {
      // Re-fetch the updated dashboard data
      const dashboardResponse = await FetchHelper.list.getDashboard();
      if (dashboardResponse.ok) {
        const data = dashboardResponse.data;
        setTasks(data.tasks);
        setJournals(data.journals);
      } else {
        console.error('Failed to refresh dashboard data');
      }
    } else {
      console.error('Failed to create entry');
    }
  } catch (error) {
    console.error('Error creating entry:', error);
  } finally {
    setShowForm(false);
  }
};

const handleDeleteEntry = async (id) => {
  try {
    const response = await FetchHelper.entry.delete(id);
    if (response.ok) {
      // Re-fetch the updated dashboard data
      const dashboardResponse = await FetchHelper.list.getDashboard();
      if (dashboardResponse.ok) {
        const data = dashboardResponse.data;
        setTasks(data.tasks);
        setJournals(data.journals);
      } else {
        console.error('Failed to refresh dashboard data');
      }
    } else {
      console.error('Failed to delete entry');
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};

const handlePostponeCustom = async (newDate) => {
  if (!postponeId) return;
  await FetchHelper.reminder.postpone(postponeId, newDate);
  setShowPostpone(false);
  setPostponeId(null);
  // Remove ?postpone from URL
  window.history.replaceState({}, document.title, window.location.pathname);
  // Refresh dashboard
  FetchHelper.list.getDashboard().then(response => {
    if (response.ok) {
      setTasks(response.data.tasks);
      setJournals(response.data.journals);
    }
  });
};
  return (
    <>
      <section className="menu menu6 cid-uL4xAXVHUw" id="menu06-0">
        <nav className="navbar navbar-dropdown opacityScroll navbar-fixed-top navbar-expand-lg">
          <div className="container">
            <div className="navbar-brand">
              <span className="navbar-logo">
                <img src={IMAGE_logo} alt="MemoryMate Logo" style={{ height: '3rem' }} />
              </span>
              <span className="navbar-caption-wrap">
                <span className="navbar-caption text-black display-4">MemoryMate</span>
              </span>
            </div>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
              <div className="hamburger">
                <span></span><span></span><span></span><span></span>
              </div>
            </button>
            <div className="collapse navbar-collapse opacityScroll" id="navbarSupportedContent">
              <ul className="navbar-nav nav-dropdown">
              </ul>
              <div className="navbar-buttons mbr-section-btn">
                <button
                  className="btn btn-primary display-4"
                  onClick={() => {
                    console.log('Create Entry button clicked');
                    setShowForm(true);
                  }}
                >
                  <span className="mobi-mbri mobi-mbri-plus mbr-iconfont mbr-iconfont-btn"></span> Create Entry
                </button>
              </div>
            </div>
          </div>
        </nav>
      </section>

      <section className="list06 cid-uL4zy6cXSQ" id="list06-1">
        <div className="container">
          <div className="col-12 mb-5 content-head">
            <h2>Dashboard</h2>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              <div className="item features-without-image col-12 active">
                <div className="item-wrapper">
                  <h3>Tasks</h3>
                  <ListContainer data={tasks} onDelete={(id) => handleDeleteEntry(id)} highlightId={highlightId} />
                </div>
              </div>
              <div className="item features-without-image col-12">
                <div className="item-wrapper">
                  <h3>Journals</h3>
                  <ListContainer data={journals} onDelete={(id) => handleDeleteEntry(id)} highlightId={highlightId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="entry-form-overlay">
          <div className="entry-form-popup">
            <EntryForm onSubmit={handleCreateEntry} 
            onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showPostpone && (
        <div className="entry-form-overlay">
          <div className="entry-form-header postpone-form-header">
            <h2>Postpone Task</h2>
            <button onClick={() => { setShowPostpone(false); setPostponeId(null); }} className="close-button">X</button>
            <form className="postpone-form" onSubmit={e => {
              e.preventDefault();
              const customDate = e.target.customDate.value;
              if (customDate) {
                const newDate = new Date(customDate).toISOString();
                handlePostponeCustom(newDate);
              }
            }}>
              <label style={{marginBottom: 0}}>Select how long to postpone:</label>
              <div className="postpone-options">
                {POSTPONE_OPTIONS.map(opt => (
                  <button type="button" key={opt.value} className="postpone-btn-option" onClick={() => handlePostpone(opt.value)}>{opt.label}</button>
                ))}
              </div>
              <label htmlFor="customDate">Or pick a custom date/time:</label>
              <input type="datetime-local" id="customDate" name="customDate" />
              <button type="submit">Postpone to Date</button>
              <button type="button" className="postpone-cancel-btn" onClick={() => { setShowPostpone(false); setPostponeId(null); }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default Dashboard;

