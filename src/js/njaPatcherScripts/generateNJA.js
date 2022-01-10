import * as exMLDNetScanParser from './exMLDNetScanParser.js'
import * as exMLDNetObjBinder from './bindObjectPropertiesToNJA.js'
//ExMLDNet
let generateNJAFromExMLDNetTemplate = false;
let usingCustomArmature = false
let exMLDTemplatePath = "/exmldnet_scans/"
let exMLDTemplateFile = "hucastScan.txt"
let evalflagStatus = true

//NJA
let njat = "";
let name = "NODE_DEMO"
let textureName = name + "_tex"
let custom_comment = "Project comment: Prehistoric HUcast"
//ARGB
let njatColours = [[255, 255, 255, 255], [255, 255, 255, 255], [8, 255, 255, 255]]

//Control
let outputReadyNja = false

export function changeEvalflagStatus(){
  evalflagStatus = !evalflagStatus
  console.log(evalflagStatus);
}

export function setScanFile(scanFile){
  exMLDTemplateFile = scanFile
}

export function useExMLDNetTemplate(){
  generateNJAFromExMLDNetTemplate = true
}

export function isOutputReadyNja(){
  return outputReadyNja
}

export function returnNinjaNja(){
  return njat
}

export async function makeNJA(modelData, triangleStrips, stripDirections, memoryInfo, exMLDTemplate, textureCount, textureIDList){
  //Can probably remove commented scan parsing from generateNJA
  //let exMLDTemplate
  /*
  if(generateNJAFromExMLDNetTemplate){
    let response = await fetch(exMLDTemplatePath + exMLDTemplateFile)
    let scan = await response.text();
    exMLDTemplate = exMLDNetScanParser.parseExMldNetScan(scan)
    modelData = exMLDNetObjBinder.bindModelDataWithExMldNetScan(modelData, exMLDTemplate)
    triangleStrips = exMLDNetObjBinder.bindDataLength(triangleStrips, exMLDTemplate)
    stripDirections = exMLDNetObjBinder.bindDataLength(stripDirections, exMLDTemplate)
    memoryInfo = exMLDNetObjBinder.bindDataLength(memoryInfo, exMLDTemplate)
  }
  */
  for(let model in modelData){
    if(modelData[model][7] != undefined){
      modelData[model].push(true)
    }else{
      modelData[model].push(false)
    }
  }

  njat = makeNJAheader(njat)
  var doesModelHaveTexture = modelData[0][6][1];
  if(doesModelHaveTexture){
    njat = makeNJAtextureList(njat, textureCount)
  }
  //console.log(textureIDList);
  let geometryIndex = -1
  //console.log(exMLDTemplate);
  for(let model in modelData){
    let rootNode = false
    let nodeName = name + "_node@" + model
    if(model == modelData.length-1){
      rootNode = true
    }
    //if node model contains 3D model (geometry)
    if(modelData[model][8]){
      geometryIndex += 1
    }
    njat = makeNJAcnkObject(rootNode, nodeName, model, modelData.length, modelData[model][8], modelData[model], triangleStrips[model], stripDirections[model], memoryInfo[model], exMLDTemplate, textureIDList[geometryIndex])
  }
  let footer = makeNJAfooter(doesModelHaveTexture)
  //document.getElementById("output").innerHTML = njat
  outputReadyNja = true
}

function makeNJAfooter(hasTexture){
  njat+=`\n\nDEFAULT_START`
  njat+=`\n\n#ifndef DEFAULT_OBJECT_NAME\n#define DEFAULT_OBJECT_NAME object_${name+"_root_node"}\n#endif`
  if(hasTexture){
    njat+=`\n#ifndef DEFAULT_TEXLIST_NAME\n#define DEFAULT_TEXLIST_NAME texlist_${textureName}\n#endif`
  }
  njat+=`\n\nDEFAULT_END`
}

function makeNJAcnkObject(rootNode, nodeName, modelID, modelCount, geometry, modelData, triangleStrips, stripDirections, memoryInfo, exMLDTemplate, textureID){
  let hasNormals = modelData[6][0]
  let hasTexture = modelData[6][1]
  if(geometry){
    njat+="\n\n"
    njat+="CNKOBJECT_START"
    njat+="\n\n"
    njat = generatePLIST(rootNode, njat, nodeName, hasTexture, modelData, triangleStrips, stripDirections, memoryInfo, textureID)
    njat = generateVLIST(rootNode, njat, nodeName, hasNormals, modelData, memoryInfo)
    //Pass center and radius info here
    njat = defineCnkModel(rootNode, njat, nodeName)
  }
  njat = defineCnkObject(rootNode, njat, nodeName, modelID, modelCount, geometry, modelData, exMLDTemplate, hasTexture)
  njat+=`\n\nCNKOBJECT_END`
  return njat
}

//And here
function defineCnkModel(rootNode, njat, nodeName){
  if(rootNode){nodeName = `${name}_root_node`}
  njat+=`\n\nCNKMODEL model_${nodeName}[]\nSTART`
  njat+=`\nVList\tvertex_${nodeName},`
  njat+=`\nPList\tstrip_${nodeName},`
  njat+=`\nCenter\t0.000000F, 0.000000F, 0.000000F,`
  njat+=`\nRadius\t1.732051F,`
  njat+="\nEND"
  return njat
}

function setEvalFlag(evalflagStatus){
  let evalFlag = ""
  if(evalflagStatus){
    evalFlag = "( FEV_UT|FEV_UR|FEV_US|FEV_BR ),"
  }else{
    evalFlag = "( 0x00000016 ),"
    //00000016 works for 'data' char models, even as NJTL header
    //but is reserved for NJCM model atm
  }
  return evalFlag
}

function defineCnkObject(rootNode, njat, nodeName, modelID, modelCount, geometry, modelData, exMLDTemplate, hasTexture){
  let nodePrevious = name + "_node@" + parseInt(modelID-1)
  let nodePreviousPrevious = name + "_node@" + parseInt(modelID-2)
  if(rootNode){nodeName = `${name}_root_node`}
  if(!geometry){
    njat+="\n\n"
    njat+="CNKOBJECT_START"
  }
  njat+=`\n\nCNKOBJECT object_${nodeName}[]\nSTART`

  njat+=`\nEvalFlags ${setEvalFlag(evalflagStatus)}`

  if(geometry){
    njat+=`\nCNKModel   model_${nodeName},`
  }else{
    njat+=`\nCNKModel   NULL,`
  }
  if(generateNJAFromExMLDNetTemplate){
    njat+=`\nOPosition  (  ${modelData[7][0]}F,  ${modelData[7][1]}F,  ${modelData[7][2]}F ),`
    njat+=`\nOAngle     (  ${modelData[7][3]}F,  ${modelData[7][4]}F,  ${modelData[7][5]}F ),`
    njat+=`\nOScale     (  ${modelData[7][6]}F,  ${modelData[7][7]}F,  ${modelData[7][8]}F ),`
    let childNodeAbstract = name + "_node@"
    let siblingNodeAbstract = name + "_node@"
    for(let node in exMLDTemplate){
      if(exMLDTemplate[modelID][5] == exMLDTemplate[node][7]){
        childNodeAbstract+=node
      }
      if(exMLDTemplate[modelID][6] == exMLDTemplate[node][7]){
        siblingNodeAbstract+=node
      }
    }
    if(exMLDTemplate[modelID][3] == true && exMLDTemplate[modelID][4] == true){
      njat+=`\nChild       object_${childNodeAbstract},`
      njat+=`\nSibling     object_${siblingNodeAbstract},`
    }else{
      if(exMLDTemplate[modelID][3] == true){
        njat+=`\nChild       object_${childNodeAbstract},`
      }else{
        njat+=`\nChild       NULL,`
      }
      if(exMLDTemplate[modelID][4] == true){
        njat+=`\nSibling     object_${siblingNodeAbstract},`
      }else{
        njat+=`\nSibling     NULL,`
      }
    }
    njat+=`\nEND`
  }else{
    njat+=`\nOPosition  (  ${modelData[7][0]}F,  ${modelData[7][1]}F,  ${modelData[7][2]}F ),`
    njat+=`\nOAngle     (  0.000000F,  0.000000F,  0.000000F ),`
    njat+=`\nOScale     (  1.000000F,  1.000000F,  1.000000F ),`
    if(modelID == 0){
      njat+=`\nChild       NULL,`
      njat+=`\nSibling     NULL,`
      njat+=`\nEND`
    }else{
      njat+=`\nChild       NULL,`
      njat+=`\nSibling     object_${nodePrevious},`
      njat+=`\nEND`
    }
    if(modelID == modelCount-1){
      if(usingCustomArmature){
        njat+=`\n\nCNKOBJECT_END`
        njat = makeRootNode(njat, nodeName, modelData)
      }
    }
  }
  return njat
}

function makeRootNode(njat, childNode, modelData){
  njat+=`\n\nCNKOBJECT_START`
  njat+=`\n\nCNKOBJECT object_${name+"_root_node"}[]\nSTART`
  njat+=`\nEvalFlags ${setEvalFlag(evalflagStatus)}`
  njat+=`\nCNKModel   NULL,`
  njat+=`\nOPosition  (  0.000000F,  0.000000F,  0.000000F ),`
  njat+=`\nOAngle     (  0.000000F,  0.000000F,  0.000000F ),`
  njat+=`\nOScale     (  1.000000F,  1.000000F,  1.000000F ),`
  njat+=`\nChild       object_${childNode},`
  njat+=`\nSibling     NULL,`
  njat+=`\nEND`
  return njat
}

function generatePLIST(rootNode, njat, nodeName, hasTexture, modelData, triangleStrips, stripDirections, memoryInfo, textureID){
  if(rootNode){nodeName = `${name}_root_node`}
  njat+=`PLIST strip_${nodeName}[]` + "\nSTART" + "\n\tCnkM_DAS( FBS_SA|FBD_ISA ), 6,"
  njat+=`\n\tMDiff( ${njatColours[0]} ),\n\tMAmbi( ${njatColours[1]} ),\n\tMSpec( ${njatColours[2]} ),`
  if(hasTexture){
    njat+=`\n\tCnkT_TID( 0x0|FDA_100 ), _TID( FFM_BF, ${textureID} ),`
    njat+=`\n\tCnkS_UVN(0x0), ${memoryInfo[0]}, _NB(UFO_0, ${triangleStrips[0].length}),`
  }else{
    njat+=`\n\tCnkS( 0x0 ), ${memoryInfo[0]}, _NB( UFO_0, ${triangleStrips[0].length} ),`
  }
  let textureCount = 0
  let count = 0
  for(let strips in triangleStrips[0]){
    if(hasTexture){
      njat+=`\n\t${stripDirections[strips]}(${triangleStrips[0][strips].length}),`
      for(let vert in triangleStrips[0][strips]){
        njat+=`\n\t${triangleStrips[0][strips][vert]}, Uvn( ${modelData[2][0][0][textureCount]}, ${modelData[2][0][1][textureCount]} ),`
        textureCount+=1;
      }
    }else{
      njat+=`\n\t${stripDirections[strips]}(${triangleStrips[0][strips].length}),`
      for(let vert in triangleStrips[0][strips]){
        njat+=` ${triangleStrips[0][strips][vert]},`
        count+=1
        if(vert != triangleStrips[0][strips].length-1){
          if(count > 9){
            njat+="\n\t\t"
            count = 0
          }
        }
      }
    }
    count = 0
  }
  return njat+"\n\tCnkNull(),\n\tCnkEnd()\nEND"
}

function generateVLIST(rootNode, njat, nodeName, hasNormals, modelData, memoryInfo){
  if(rootNode){nodeName = `${name}_root_node`}
  njat+=`\nVLIST vertex_${nodeName}[]\nSTART`;
  let vListMode = (hasNormals ? "CnkV_VN" : "CnkV")
  njat+=`\n\t${vListMode}(0x0, ${memoryInfo[3]}),\n\tOffnbIdx(0, ${memoryInfo[4]}),`
  let x = []
  let y = []
  let z = []
  let xn = []
  let yn = []
  let zn = []
  let vertEntry = []
  let normalEntry = []
  for(let entry in modelData[0][0][0]){
    x = modelData[0][0][0][entry];
    y = modelData[0][0][1][entry];
    z = modelData[0][0][2][entry];
    vertEntry.push([x, y, z])

  }
  if(hasNormals){
    for(let entry in modelData[1][0][0]){
      xn = modelData[1][0][0][entry];
      yn = modelData[1][0][1][entry];
      zn = modelData[1][0][2][entry];
      normalEntry.push([xn, yn, zn])
    }
  }
  for(let vert in vertEntry){
    njat+=`\n\tVERT( ${vertEntry[vert][0]}, ${vertEntry[vert][1]}, ${vertEntry[vert][2]} ),`
    if(hasNormals){
      njat+=`\n\tNORM( ${normalEntry[vert][0]}, ${normalEntry[vert][1]}, ${normalEntry[vert][2]} ),`
    }
  }
  njat += "\n\tCnkEnd()\nEND"
  return njat
}

function makeNJAheader(njat){
njat =`/* NJA 0.96alpha1 NinjaAsciiDataMix CnkModel (MAX) */
/* NJA PATCHER - ${custom_comment}  */
/* ROOT OBJECT : ${name} */`
return njat
}

function makeNJAtextureList(njat, textureCount){
  let textureIDStringPadding = [`\n\tTEXN( "`, `"),`]
  let textureIDString = ""
  for(let textureID = 0; textureID < textureCount; textureID++){
    textureIDString += textureIDStringPadding[0] + `texture${textureID}` + textureIDStringPadding[1];
  }
  //console.log(textureIDString);

  njat+=`\n/* TEXLIST : texlist_${textureName} */\n\nTEXTURE_START\n\nTEXTURENAME textures_${textureName}[]\nSTART`
  +textureIDString+`\nEND\nTEXTURELIST texlist_${textureName}\nSTART\nTextureList textures_${textureName},\nTextureNum  ${textureCount},\nEND\n\nTEXTURE_END`
  return njat
}
