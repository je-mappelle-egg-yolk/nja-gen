import * as exMLDNetScanParser from './scripts/exMLDNetScanParser.js'

export async function parseScan(scanPath){
  let response = await fetch(scanPath)
  let scan = await response.text();
  return exMLDNetScanParser.parseExMldNetScan(scan)
}

export function extractTranslationData(parsedScan){
  let preBindTemplate = []
  for(let data in exMLDTemplate){
    //Only get translation data, for 3D view display in other applications
    if(exMLDTemplate[data].length > 8)
      preBindTemplate.push(exMLDTemplate[data][2])
      preBindTemplate = preBindTemplate.reverse()
  }
  return preBindTemplate
}
