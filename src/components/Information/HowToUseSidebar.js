import React, {useState} from 'react'
import HowToUseDisplay from './HowToUseDisplay';

function HowToUseSidebar(){
    const [contentDisplay, setContentDisplay] = useState("njaGen is a tool for converting OBJ models into NJA (ASCII) or NJ (Binary) model formats, which are 3D model formats used in SEGA Dreamcast hardware and software.\n\nnjaGen uses a modified version of njaPatcher and scan outputs from ExMLDNet (credit: Kryslin), in order to compile new OBJ models into existing meshes from Phantasy Star Online.");
    const [headerDisplay, setHeaderDisplay] = useState("About")
    
    function readTextFile(file)
    {
        var request = new XMLHttpRequest();
        request.open("GET", file, false);
        request.onreadystatechange = function ()
        {
            if(request.readyState === 4)
            {
                if(request.status === 200 || rawFile.status == 0)
                {
                    var text = request.responseText;
                    setContentDisplay(text)
                }
            }
        }
        request.send(null);
    }

    function loadTextFile(textContents){
        let filePath = "src/assets/text/Information/how_to_use/"
        switch(textContents){
            case "ABOUT":
                setHeaderDisplay("About")
                readTextFile(filePath + "about.txt")
                break;
            case "FUTURE_OF_NJAGEN":
                setHeaderDisplay("Future of njaGen")
                readTextFile(filePath + "future_of_njagen.txt")
                break;
            case "DEFAULT_MODEL_PART":
                setHeaderDisplay("\"Default\" model part")
                readTextFile(filePath + "default_model_part.txt")
                break;
            case "MAKING_USABLE_OBJ_FILES":
                setHeaderDisplay("Making usable OBJ files")
                readTextFile(filePath + "making_usable_obj_files.txt")
                break;
            case "MULTIPLE_OBJ_TO_NJA":
                setHeaderDisplay("Mutiple OBJ to NJA")
                readTextFile(filePath + "multiple_obj_to_nja.txt")
                break;
            case "NJA_FORMAT_DECRIPTION":
                setHeaderDisplay("NJA format description")
                readTextFile(filePath + "nja_format_description.txt")
                break;
            case "NINJA_GENERATION_SETTINGS":
                setHeaderDisplay("Ninja generation settings")
                readTextFile(filePath + "ninja_generation_settings.txt")
                break;
            case "MAKING_USE_OF_NJA_NJ":
                setHeaderDisplay("Making use of NJA/NJ")
                readTextFile(filePath + "making_use_of_nja_nj.txt")
                break;
            case "ITEM_MOD":
                setHeaderDisplay("Item mod")
                readTextFile(filePath + "item_mod.txt")
                break;
            case "HUCAST_BODY_MOD":
                setHeaderDisplay("HUcast body mod")
                readTextFile(filePath + "hucast_body_mod.txt")
                break;
        }
        console.log("wwoow");
    }
    return(
        <div className='htu-main-container'>
            <div className='htu-sidebar'>
                <div className='htu-button-container'>
                    <h3 className='htu-section-header'>General</h3>
                    <button className='htu-button' onClick={() => loadTextFile("ABOUT")}>About</button>
                        <button className='htu-button' onClick={() => loadTextFile("FUTURE_OF_NJAGEN")}>Future of njaGen</button>
                    <h3 className="htu-section-header">OBJ</h3>
                        <button className='htu-button' onClick={() => loadTextFile("DEFAULT_MODEL_PART")}>"Default" model part</button>
                        <button className='htu-button' onClick={() => loadTextFile("MAKING_USABLE_OBJ_FILES")}>Making usable OBJ files</button>
                        <button className='htu-button' onClick={() => loadTextFile("MULTIPLE_OBJ_TO_NJA")}>Multiple OBJ to NJA</button>
                    <h3 className='htu-section-header' >NJA/NJ</h3>
                        <button className='htu-button' onClick={() => loadTextFile("NINJA_GENERATION_SETTINGS")}>Ninja generation settings</button>
                        <button className='htu-button' onClick={() => loadTextFile("MAKING_USE_OF_NJA_NJ")}>Making use of NJA/NJ</button>
                    <h3 className='htu-section-header' >PSOBB</h3>
                        <button className='htu-button' onClick={() => loadTextFile("ITEM_MOD")}>Item mod</button>
                        <button className='htu-button' onClick={() => loadTextFile("HUCAST_BODY_MOD")}>HUcast body mod</button>
                </div>
                <HowToUseDisplay contentToDisplay={contentDisplay} headerToDisplay={headerDisplay}/>
            </div>
        </div>
    )
}

export default HowToUseSidebar;