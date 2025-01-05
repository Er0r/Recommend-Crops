import React from 'react';
import { Dashboard } from './components/Dashboard';
import '@mantine/core/styles.css'; 
import Topbar from './components/Topbar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Topbar />
      <Dashboard />
    </div>
  );
}

export default App;