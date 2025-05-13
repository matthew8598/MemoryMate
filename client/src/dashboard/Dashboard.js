import React, { useEffect, useState } from 'react';
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

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
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
                <li className="nav-item">
                  <span className="nav-link link text-black display-4">About</span>
                </li>
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
                  <ListContainer data={tasks} onEdit={(id) => console.log('Edit task', id)} onDelete={(id) => console.log('Delete task', id)} />
                </div>
              </div>
              <div className="item features-without-image col-12">
                <div className="item-wrapper">
                  <h3>Journals</h3>
                  <ListContainer data={journals} onEdit={(id) => console.log('Edit journal', id)} onDelete={(id) => console.log('Delete journal', id)} />
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
    </>
  );
};

export default Dashboard;
