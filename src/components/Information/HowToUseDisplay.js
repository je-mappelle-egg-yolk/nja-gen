import React from 'react'

function HowToUseDisplay(props){
    return(
        <div className='htu-display-container'>
            <h3 className='htu-display-header'>{props.headerToDisplay}</h3>
            <pre className='htu-pre'>{props.contentToDisplay}</pre>
        </div>
    )
}

export default HowToUseDisplay;