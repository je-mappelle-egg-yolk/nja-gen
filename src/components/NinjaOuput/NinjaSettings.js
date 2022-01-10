//React
import React, { useState } from 'react';
//Components
import NinjaDisplay from './NinjaDisplay';
//Vanilla JS
import * as nP from "../njaPatcher";
import * as nA from "../njaArmature";

function NinjaSettings(props) {
    const [flashNjHandler, setFlashNjState] = useState(false)
    const [optimizeStripsHandler, setOptimizationState] = useState(false)
    const [removeNormalsHandler, setNormalsState] = useState(false)
    const [removeTexturesHandler, setTexturesState] = useState(false)
    const [evalflagStatusHandler, setEvalflagState] = useState(false)
    const [ninjaOutput, setNinjaOutput] = useState("File output will load here")
    //Nja Patcher
    let objFilePath = "./src/assets/default_obj/"
    let nja = new nP.njaPatcher(objFilePath)

    function changeFlashNjStatus(){
        setFlashNjState(!flashNjHandler)
        let rnCB = document.querySelector('#removeNormalsCB');
        let rtCB = document.querySelector('#removeTexturesCB');
        let aefCB = document.querySelector('#alternativeEvalflagCB');
        if(!flashNjHandler){    
            rnCB.disabled = true
            rtCB.disabled = true
            aefCB.disabled = true
        }else{
            rnCB.disabled = false
            rtCB.disabled = false
            aefCB.disabled = false
        }
    }

    function changeNormalsLoadStatus(){
        setNormalsState(!removeNormalsHandler)
        nja.unloadNormals()
    }

    function changeTextureLoadStatus(){
        setTexturesState(!removeTexturesHandler)
        nja.unloadTextures()
    }

    function changeStripStatus(){
        setOptimizationState(!optimizeStripsHandler)
        nja.optimizeStrips();
    }

    function changeStripStatus(){
        setOptimizationState(!optimizeStripsHandler)
        nja.optimizeStrips();
    }

    function changeEvalflagSettingStatus(){
        setEvalflagState(!evalflagStatusHandler)
        nja.changeEvalflagStatus();
    }

    function ninjaGenerationSetup(){
        //console.log(props.extractFilePaths());
        switch(props.selectedNodeModel){
            case "SINGLE_MODEL":
                generateNinjaAsSingleObject();
                break;
            case "HUCAST_BODY":
                let armature = new nA.hucastArmature();
                generateNinjaAsArmature(armature);
                break;
        }
    }

    function generateNinjaAsArmature(armature){
        nja.setScanPath("./src/assets/scans/")
        setNinjaOutput("generating nja...")

        let stagedFilePaths = props.extractFilePaths()
        let fileNames = parseFileNames(stagedFilePaths)

        let filePaths = parseFilePaths(fileNames, stagedFilePaths)

        assignArmature(armature, fileNames)
        nja.loadOBJAsArmature(filePaths, fileNames, armature)
        setTimeout(() => {
            setNinjaOutput(nja.getNinjaOutput());
            nja = null;
            armature = null;
        }, 5000)
        
    }

    function generateNinjaAsSingleObject(){
        let stagedFilePaths = props.extractFilePaths()
        nja.setScanPath("./src/assets/scans/")
        let fileName = parseFileNames(stagedFilePaths)
        let filePath = parseFilePaths(fileName, stagedFilePaths)
        let objFilePath = filePath;
        let objFileList = fileName;
        let objPosList = []
        objPosList[0] = ["0.000000", "0.000000", "0.000000"]
        if(flashNjHandler){
            nja.flashNJ()
            setNinjaOutput("generating nj...")
        }else{
            setNinjaOutput("generating nja...")
        }
        nja.loadOBJ(objFilePath, objFileList, objPosList, 1, [0])
        setTimeout(() => {
            setNinjaOutput(nja.getNinjaOutput());
            nja = null;
        }, 5000)
    }
    
    return (
        <div className='component-content'>
            <h2>ninja generation settings</h2>
            <div className='ninja-settings-input-container'>
                <table className='ninja-settings-table'>
                    <tbody>
                        <tr>
                            <th className='ninja-settings-header-cell'>Generate NJ</th>
                            <th className='ninja-settings-header-cell'>Optimize Strips</th>
                            <th className='ninja-settings-header-cell'>Remove Normals</th>
                            <th className='ninja-settings-header-cell'>Remove Textures</th>
                        </tr>
                        <tr>
                            <td className='ninja-settings-header-cell'><input className="ninja-settings-input" type="checkbox" id="generateNjCB" disabled={props.generateNjCBStatus} onChange={changeFlashNjStatus}></input></td>
                            <td className='ninja-settings-header-cell'><input className="ninja-settings-input" type="checkbox" id="optimizeStripsCB" onChange={changeStripStatus}></input></td>
                            <td className='ninja-settings-header-cell'><input className="ninja-settings-input" type="checkbox" id="removeNormalsCB" onChange={changeNormalsLoadStatus}></input></td>
                            <td className='ninja-settings-header-cell'><input className="ninja-settings-input" type="checkbox" id="removeTexturesCB" onChange={changeTextureLoadStatus}></input></td>
                        </tr>
                        <tr>
                            <th className='ninja-settings-header-cell'>Alternative Evalflag</th>
                        </tr>
                        <tr>
                            <td className='ninja-settings-header-cell'><input className="ninja-settings-input" type="checkbox" id="alternativeEvalflagCB" onChange={changeEvalflagSettingStatus}></input></td>
                        </tr>
                    </tbody>
                </table>
                <button className="custom-generic-button" onClick={ninjaGenerationSetup}>generate ninja model</button>
            </div>
            <NinjaDisplay output={ninjaOutput}></NinjaDisplay>
        </div>
    );
}

function assignArmature(rig, filePathArray){
    //rig.fillArmature()
    rig.neck = filePathArray[0];
    rig.leftHand = filePathArray[1];
    rig.leftElbow = filePathArray[2];
    rig.leftShoulder = filePathArray[3];
    rig.leftShoulder2 = filePathArray[4];
    rig.rightHand = filePathArray[5];
    rig.rightElbow = filePathArray[6];
    rig.rightShoulder = filePathArray[7];
    rig.rightShoulder2 = filePathArray[8];
    rig.chest = filePathArray[9];
    rig.leftFoot = filePathArray[10];
    rig.leftKnee = filePathArray[11];
    rig.leftHip = filePathArray[12];
    rig.rightFoot = filePathArray[13];
    rig.rightKnee = filePathArray[14];
    rig.rightHip = filePathArray[15];
    rig.stomach = filePathArray[16];
    rig.nadir = filePathArray[17];
    rig.default = filePathArray[18];
}  

//Need to move this into JS module -- reverseString, parseFileNames, parseFilePaths

function reverseString(s){
    return s.split("").reverse().join("");
}

function parseFileNames(filePathArray){
    let stringBuffer = "";
    let newString = "";
    let returnArray = [];

    for(let filePaths in filePathArray){
        stringBuffer = reverseString(filePathArray[filePaths]);
        for(let ch = 0; ch < stringBuffer.length; ch++){
            if(stringBuffer[ch] !== '\\'){
                newString+=stringBuffer[ch]
            }else{
                break
            }
        }
        returnArray.push(reverseString(newString))
        stringBuffer = "";
        newString = "";
    }
    return configureDefaultPath(returnArray)
}

function parseFilePaths(fileNameArray, filePathArray){
    let stringBuffer = "";
    let returnArray = [];
    for(let filePath in filePathArray){
        stringBuffer = filePathArray[filePath].replace(fileNameArray[filePath], "")
        returnArray.push(stringBuffer)
    }
    return configureDefaultPath(returnArray)
}

function configureDefaultPath(fileArray){
    console.log(fileArray.length);
    if(fileArray[fileArray.length-1] !== ''){
        for(let filePath in fileArray){
            if(fileArray[filePath] === ''){
                fileArray[filePath] = fileArray[fileArray.length-1]
            }
        }
    }else if(fileArray[fileArray.length-1] == ''){
        let fileCount = 0
        let missingFileCheck = false
        for(let filePath in fileArray){
            if(fileCount === (fileArray.length-1) && missingFileCheck === false){
                fileArray.pop()
                fileArray.push(fileArray[0])
            }
            if(fileArray[filePath] === ''){
                missingFileCheck = true
                break
            }
            fileCount+=1
        }
    }
    console.log(fileArray);
    return fileArray
}

export default NinjaSettings;
  