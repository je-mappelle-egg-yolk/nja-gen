import React from 'react'

function ModelPart(props){
    return(
        <div className='part-selection-input-container'>
            <label className='part-selection-label'>{props.modelPart}</label>
            <input id="obj-input" className='part-selection-input' type='file' accept='.obj'></input>
        </div>
    )
}

export default ModelPart;