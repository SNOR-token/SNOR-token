var componentsName = {};

function initComponents () {
    var sku = getSKU();

    var prerequisteComponents = Config_PrerequisteComponents;
    if(Config_MultiDownload){
        prerequisteComponents = Components;
    }

    var langText = getLangText();
    for (var i = 0; i < prerequisteComponents.length; ++i) {
        var component = prerequisteComponents[i];
        if (component["sku"] == sku && ((component["type"] & ComponentType.Prerequiste) != 0)) {
            if(Config_CheckPrerequiste && appExternal.getProperty(component["name"] + "32") !== "true" && appExternal.getProperty(component["name"] + "64") !== "true") {
                continue;
            }
            var compName = {};
            // init Component Name
            compName["name"] = langText[component["name"]];
            // init mustSelect property
            if ((component["type"] & ComponentType.MustSelect) != 0) {
                compName["mustSelect"] = true;
            } else {
                compName["mustSelect"] = false;
            }

            componentsName[component["name"]] = compName;
        }
    }
}

function setItems () {
    for(var key in componentsName) {   
        appExternal.setProperty(key + "64", "true");
        appExternal.setProperty(key + "32", "true");
    }
}

function initialize () {
    var isISO = appExternal.getProperty("isISO") == "true" ? true : false;
    if (isISO) {
        Navigator.nextPage();
        return;
    }

    setTextToPage();
    initComponents();

    if(isSilentlyLaunch()){
        Navigator.nextPage();     
    }
}

$(document).ready(function () {
    $("#next").click(function () {
        trackUserActivity("Prerequisite_Next");
        setItems();
        Navigator.nextPage();
    });

    $("#header_close_img").click(function () {
        trackUserActivity("Prerequisite_Close");
        notifyFinalStatus(Config_Status.CANCEL);
        closeApp();
    });

    $("#back").click(function() {
        trackUserActivity("Prerequisite_Back");
        Navigator.previousPage();
    });

    initialize();
});