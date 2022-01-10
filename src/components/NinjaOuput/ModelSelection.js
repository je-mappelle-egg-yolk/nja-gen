//React
import React, {useState} from 'react'
import ModelPart from './ModelPart'
import NinjaSettings from './NinjaSettings';

function ModelSelection(){
    const [getSelectedNodeModel, setSelectedNodeModel] = useState("SINGLE_MODEL")
    const [modelListHandler, setModelList] = useState(["model"])
    const [generateNjCBStatus, setGenerateNjCBStatus] = useState(false)

    let componentLoaderMap = modelListHandler.map(part => <ModelPart key={part} modelPart={part}></ModelPart>)
    let modelCount = modelListHandler.length
    let stagedModelPaths = [];
    
    function extractFilePaths(){
        stagedModelPaths = [];
        document.querySelector('form').addEventListener('submit', (event) => {
            event.preventDefault();
        })
        let tempModelPaths = document.querySelectorAll("input[type='file']")
        //console.log(tempModelPaths[18].files[0].path);
        for(let modelPath in tempModelPaths){
            if(modelPath <= modelCount){
                if(tempModelPaths[modelPath].value !== ""){
                    stagedModelPaths.push(tempModelPaths[modelPath].files[0].path)
                }else{
                    stagedModelPaths.push("")
                }
            }  
        }
        return stagedModelPaths;
    }

    function changePartsSection(partsToLoad){
        setSelectedNodeModel(partsToLoad)

        if(partsToLoad==="SINGLE_MODEL"){
            setGenerateNjCBStatus(false)
            setModelList(["model"])
        }else if(partsToLoad==="HUCAST_BODY"){
            setGenerateNjCBStatus(true)
            setModelList(["neck", "left hand", "left elbow", "left shoulder", "left shoulder 2", "right hand", "right elbow", "right shoulder", "right shoulder 2", 
            "chest", "left foot", "left knee", "left hip", "right foot", "right knee", "right hip", "stomach", "nadir", "default"])
        }
        modelCount = modelListHandler.length;
    }

    //modelListHandler, setModelList
    return(
        <div className='component-container'>
            <div className='model-selection-container'>
                <h2>obj model selection</h2>
        
                <select onChange={(event) => {
                    changePartsSection(event.target.value)
                }}>
                    <option value="SINGLE_MODEL">Single model</option>
                    <option value="HUCAST_BODY">HUcast body</option>
                </select>

                <form className='component-loader-form'>
                    {
                        componentLoaderMap
                    }                   
                </form>
            </div>
            <NinjaSettings extractFilePaths={extractFilePaths} selectedNodeModel={getSelectedNodeModel} generateNjCBStatus={generateNjCBStatus}></NinjaSettings>
        </div>
    )
}

export default ModelSelection;