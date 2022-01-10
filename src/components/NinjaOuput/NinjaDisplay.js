import React from 'react';

function NinjaDisplay(props){
    return(
        <div className='container-content'>
            <h2>output</h2>
            <div className='pre-container'>
                <pre>{props.output}</pre>
            </div>
        </div>
    )
}

export default NinjaDisplay;

