import * as objParser from '../js/njaPatcherScripts/objParser.js'
import * as generateNJA from '../js/njaPatcherScripts/generateNJA.js'
import * as njaMemory from '../js/njaPatcherScripts/njaMemory.js'
//import * as njaArmature from './scripts/njaArmature.js'
import * as triangleStripper from '../js/njaPatcherScripts/triangleStripper.js'
import * as njPatcher from '../js/njaPatcherScripts/njPatcher.js'
import * as njPatcherMulti from '../js/njaPatcherScripts/njPatcherMulti.js'
import * as exMLDNetScanParser from '../js/njaPatcherScripts/exMLDNetScanParser.js'
import * as exMLDNetObjBinder from '../js/njaPatcherScripts/bindObjectPropertiesToNJA.js'

export function njaPatcher(objFilePath){
  let version = "V0.28a"
  //document.getElementById("version").innerHTML = "njaPatcher demo build: " + version

  let missingObjFiles = false;
  let ninjaOutput = ""
  let scanData = ""
  let flashNJ = false
  let forceTextureCoords = false;
  let forceNormalEntries = false;
  let forcedNormals = []
  let forcedTextures = []

  let textureComment = "this doesn't change anything yet"
  let njatColours = [[255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 8]]

  //part of exMLDNetScan section
  let usingArmature = false
  let exMLDTemplate = ""
  let preBindTemplate = []
  let scanComplete = false
  let exMLDTemplatePath = "/exmldnet_scans/"
  

  let objList = []
  let emptyNodeList = []
  let objParsedDataList = []
  let modelTriangleStripsList = []
  let modelCompleteInfoList = []
  let modelMemoryInfoList = []

  let normal, texture;

  async function loadOBJ(filePaths, objFiles, objPosList, textureCount, textureIDList){
    for(let obj in objFiles){
      if(objFiles[obj] != "empty_node"){
        try {
          let response = await fetch(filePaths[obj] + objFiles[obj])
          let data = await response.text();
          objList.push(data)
        } catch(error) {
          ninjaOutput = "Error: Some model parts are not specified, try loading a default model if it is available"
          missingObjFiles = true
        }
      }else{
        objList.push("")
      }
    }

    for(let objModel in objList){
      objParsedDataList.push(objParser.parseOBJ(objList[objModel], objModel))
      objParsedDataList[objModel][7] = (objPosList[objModel])
    }

    for(let parsedData in objParsedDataList){
      normal = objParsedDataList[parsedData][6][0]
      texture = objParsedDataList[parsedData][6][1]
      modelTriangleStripsList.push(triangleStripper.generateNJATriangleStrip(objParsedDataList[parsedData][4][0][0], objParsedDataList[parsedData][4][0][1], texture))
      if(normal){
        objParsedDataList[parsedData][1][0] = reorderNormals(objParsedDataList[parsedData][1][0][0], objParsedDataList[parsedData][1][0][1],
          objParsedDataList[parsedData][1][0][1]
        , objParsedDataList[parsedData][5][0], objParsedDataList[parsedData][5][2])
      }
      if(texture){
        objParsedDataList[parsedData][2][0] = reorderTexture(objParsedDataList[parsedData][2][0][0], objParsedDataList[parsedData][2][0][1],
          modelTriangleStripsList[parsedData][0], modelTriangleStripsList[parsedData][1]
        , objParsedDataList[parsedData][5][0], objParsedDataList[parsedData][5][2])
      }

      modelMemoryInfoList.push(njaMemory.generateMemoryInfo(objParsedDataList[parsedData][0][0][0].length, normal, texture
      ,  modelTriangleStripsList[parsedData][0], objParsedDataList[parsedData][2][0]))
    }
    for(let node in emptyNodeList){
      objParsedDataList.push(emptyNodeList[node])
    }
    ////////////////////////////////////////////////////////////////////////////
    //objParsedDataList, modelTriangleStripsList, triangleStripper.getStripDirectionAsText(), modelMemoryInfoList

    //This exMLD coding is from generateNJA - It will be used in njPatcherMulti later
    //for exMLDNetScan direct to NJ, for now it is duplicate code
    let stripDirections = triangleStripper.getStripDirectionAsText()
    if(usingArmature){
      let generateNJAFromExMLDNetTemplate = true
      let exMLDTemplateFile = "hucastScan.txt"
      if(generateNJAFromExMLDNetTemplate){
        let response = await fetch(exMLDTemplatePath + exMLDTemplateFile)
        let scan = await response.text();
        exMLDTemplate = exMLDNetScanParser.parseExMldNetScan(scan)
        for(let data in exMLDTemplate){
          //Only get model data, for 3D view display in other applications
          if(exMLDTemplate[data].length > 8)
          preBindTemplate.push(exMLDTemplate[data][2])
          preBindTemplate = preBindTemplate.reverse()
        }
        objParsedDataList = exMLDNetObjBinder.bindModelDataWithExMldNetScan(objParsedDataList, exMLDTemplate)
        modelTriangleStripsList = exMLDNetObjBinder.bindDataLength(modelTriangleStripsList, exMLDTemplate)
        stripDirections = exMLDNetObjBinder.bindDataLength(stripDirections, exMLDTemplate)
        modelMemoryInfoList = exMLDNetObjBinder.bindDataLength(modelMemoryInfoList, exMLDTemplate)
        scanComplete = true
        usingArmature = false
      }
    }
    ////////////////////////////////////////////////////////////////////////////
    if(flashNJ){
      if(objParser.getUnloadStatus("normals") || objParser.getUnloadStatus("texture")){
        //document.getElementById("output").innerHTML += "Error: unloadNormals() and unloadTextures() only supported for NJA output."
      }
      if(objParsedDataList.length > 1){
        prepareNjMultiData(modelMemoryInfoList, objParsedDataList, modelTriangleStripsList)
        function prepareNjMultiData(modelMemoryInfo, modelData, triangleStrips){
          let modelBandwidths = []
          let modelBandwidthOffsets = []
          let modelVlistInfos = []

          let modelVertLists = []
          let modelNormalLists = []
          let modelTextureLists = []
          let modelTriStripLists = []

          for(let model in modelMemoryInfo){
            modelBandwidths.push(modelMemoryInfo[model][0])
            modelBandwidthOffsets.push(modelMemoryInfo[model][1])
            modelVlistInfos.push([modelMemoryInfoList[model][3], modelMemoryInfoList[model][4]])
            modelVertLists.push(modelData[model][0][0])
            modelNormalLists.push(modelData[model][1][0])
            modelTextureLists.push(modelData[model][2][0])
            modelTriStripLists.push(triangleStrips[model][0])
          }
          //NJ is written in reverse order to NJA - NJ starts with root node
          modelBandwidths = modelBandwidths.reverse()
          modelBandwidthOffsets = modelBandwidthOffsets.reverse()
          modelVlistInfos = modelVlistInfos.reverse()
          modelVertLists = modelVertLists.reverse()
          modelNormalLists = modelNormalLists.reverse()
          modelTextureLists = modelTextureLists.reverse()
          modelTriStripLists = modelTriStripLists.reverse()
          njPatcherMulti.njPatch([modelBandwidths, modelBandwidthOffsets],
            textureComment, njatColours,
            [modelVertLists, modelNormalLists, modelTextureLists, modelTriStripLists],
            modelVlistInfos
          )
        }
      }else{
        let vlistInfo = []
        vlistInfo.push(modelMemoryInfoList[0][3])
        vlistInfo.push(modelMemoryInfoList[0][4])
        njPatcher.njPatch([modelMemoryInfoList[0][0], modelMemoryInfoList[0][1]],
          textureComment, njatColours,
          [objParsedDataList[0][0][0], objParsedDataList[0][1][0], objParsedDataList[0][2][0], modelTriangleStripsList[0][0]],
          vlistInfo
        )
      }
    }else{
      generateNJA.makeNJA(objParsedDataList, modelTriangleStripsList, stripDirections, modelMemoryInfoList, exMLDTemplate, textureCount, textureIDList)
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  function reorderTexture(xt, yt, triStripList, texStripList, objVertOrder, objTexOrder){
    let tempXT=[]
    let tempYT=[]
    let njaStripOrder=[]
    let njaTexOrder=[]
    for(let strip in triStripList){
      for(let vert in triStripList[strip]){
          njaStripOrder.push(triStripList[strip][vert])
        if(texture){
          njaTexOrder.push(texStripList[strip][vert])
        }
      }
    }
    for(let vert in njaTexOrder){
      tempXT.push(xt[njaTexOrder[vert]])
      tempYT.push(yt[njaTexOrder[vert]])
    }
    xt = tempXT
    yt = tempYT
    if(forceTextureCoords){
      for(let texCoord in xt){
        xt[texCoord] = parseInt(forcedTextures[0])
        yt[texCoord] = parseInt(forcedTextures[1])
      }
    }
    return [xt, yt]
  }
  function reorderNormals(xn, yn, zn, objVertOrder, objNormalOrder){
    let tempXN=[]
    let tempYN=[]
    let tempZN=[]
    let checkedVertMap = []
    for(let vert in objVertOrder){
      checkedVertMap.push(false)
    }
    for(let i in xn){
      tempXN.push(0)
      tempYN.push(0)
      tempZN.push(0)
    }
    for(let vert in objVertOrder){
      if(checkedVertMap[objVertOrder[vert]] != true){
        if(!forceNormalEntries){
          tempXN[objVertOrder[vert]] = xn[objNormalOrder[vert]]
          tempYN[objVertOrder[vert]] = yn[objNormalOrder[vert]]
          tempZN[objVertOrder[vert]] = zn[objNormalOrder[vert]]
        }else{
          tempXN[objVertOrder[vert]] = objParser.valueToFloatingPointHex(forcedNormals[0])
          tempYN[objVertOrder[vert]] = objParser.valueToFloatingPointHex(forcedNormals[1])
          tempZN[objVertOrder[vert]] = objParser.valueToFloatingPointHex(forcedNormals[2])
        }
        checkedVertMap[objVertOrder[vert]] = true
      }
    }
    xn = tempXN
    yn = tempYN
    zn = tempZN
    return [xn, yn, zn]
  }
  return{
    loadOBJAsArmature : function(filePaths, fileNames, armature){
      objParser.isUsingArmature()
      generateNJA.useExMLDNetTemplate();
      let addRig = armature.useArmature()
      let loadPathList = addRig[0]
      let loadPosList = addRig[1]
      let textureInfo = armature.getArmatureTextureInfo()
      let textureCount = textureInfo[0]
      let textureIDList = textureInfo[1]
      usingArmature = true;
      loadOBJ(filePaths, fileNames, loadPosList, textureCount, textureIDList)
    },
    overrideArmature : function(scanPath){
      generateNJA.setScanFile(scanPath)
    },
    loadOBJ : function(objFilePath, objPathList, objPosList, textureCount, textureIDList){
      loadOBJ(objFilePath, objPathList, objPosList, textureCount, textureIDList)
    },
    objScale : (scalar) => {
      objParser.setOBJscale(scalar, "verts")
    },
    objScaleNormals : (scalar) => {
      objParser.setOBJscale(scalar, "normals")
    },
    optimizeStrips : function(){
      triangleStripper.optimizeTriangleStrips()
    },
    unloadNormals : function(){
      objParser.unload("normals")
    },
    unloadTextures : function(){
      objParser.unload("texture")
    },
    forceTextureCoords : (x, y) => {
      forceTextureCoords = true
      forcedTextures = []
      forcedTextures.push(x)
      forcedTextures.push(y)
    },
    forceNormals : (x, y, z) => {
      forceNormalEntries = true
      forcedNormals = []
      forcedNormals.push(x)
      forcedNormals.push(y)
      forcedNormals.push(z)
    },
    flashNJ : function(){
      flashNJ = !flashNJ
    },
    changeEvalflagStatus : function(){
      generateNJA.changeEvalflagStatus()
    },
    getNinjaOutput : function(){
      if(missingObjFiles){
        ninjaOutput = ninjaOutput
      }else{
        if(!flashNJ){
            ninjaOutput = generateNJA.returnNinjaNja()
        }else{
            ninjaOutput = njPatcher.returnNinjaNj()
        }
      }
      

      return ninjaOutput
    },
    setScanPath : function(scanPath){
      exMLDTemplatePath = scanPath
    },
    getScanData : function(){
      return preBindTemplate
    }
  }
}
////////////////////////////////////////////////////////////////////////////////
