import React, { useState } from 'react';
import ModelSelection from '../components/NinjaOuput/ModelSelection';
import HowToUseSidebar from '../components/Information/HowToUseSidebar'

function App() {
  let version = "v0.0.1"
  const [pageDisplay, setPage] = useState()

  return (
    <div className='app-container'>
      <div className='main-header'>
        <button className='logo-text' onClick={() => setPage()}>njaGen</button>
        <button className='logo-text' onClick={() => setPage(<HowToUseSidebar />)}>how to use</button>
        <span className='version'> |{version}</span>
        <a className='version' target="_blank" href="https://github.com/je-mappelle-egg-yolk/njaPatcher/blob/main/js/scripts/njPatcher.js">source</a>
      </div>
      {pageDisplay}
      <ModelSelection />
    </div>
  );
}
  
  export default App;
  