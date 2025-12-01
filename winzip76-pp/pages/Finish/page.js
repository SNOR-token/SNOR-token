

function initialize(){
    var status = appExternal.getProperty("Config_Status");
    if (isValidAndNotEmpty(status)) {
        status = parseInt(status);
    } else {
        status = Config_Status.CANCEL;
    }
    notifyFinalStatus(status);

    if(isSilentlyLaunch()){
        closeApp();
    } else {
        appExternal.showWindow();
    }
    
    var launchPath = appExternal.getProperty("startProgram");
    if(!Feature_LaunchApplicationButton || !isValidAndNotEmpty(launchPath)){
       $("#launch_btn").hide(); 
    }

    if (!Feature_LaunchApplicationCheckbox || !isValidAndNotEmpty(launchPath)) {
        $('#launch_box_area').hide();
    }

    setTextToPage();
}

function sleep(ms, callback) {
    setTimeout(callback, ms);
}

function finish() {
    var launchPath = appExternal.getProperty("startProgram");
    if (isValidAndNotEmpty(launchPath) && !isSilentlyLaunch()) {
        if (Feature_ThankYouPage) {
            appExternal.startProgram(launchPath, "");
            hide();
            sleep(10000, function () {
                openThankYouPage(Feature_UseTYPInInstallParams);
                closeApp();
            });
        } else {
            appExternal.startProgram(launchPath, "");
            closeApp();
        }
    } else {
        closeApp();
    }
}

$(document).ready(function () {
    initialize();
});