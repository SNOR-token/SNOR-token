var InitializeProgress = {
    timer: 0,
    start: -116,
    end: 530,
    startLoading: function () {
        var p = InitializeProgress.start;
        function loading() {
            p += 0.8;
            if (p > InitializeProgress.end) {
                p = InitializeProgress.start;
            }
            $(".initProgressLoad").css("left", p + "px");
        }
        InitializeProgress.timer = setInterval(loading, 6);
    },
    endLoading: function () {
        clearInterval(InitializeProgress.timer);
    }
};

function startLoading() {
    InitializeProgress.startLoading();
}

function endLoading() {
    InitializeProgress.endLoading();
}

function downloadCallback(result, total, current) {
    if (result !== Config_ErrorHandle.Running) {
        setTimeout(Navigator.nextPage, Feature_ShowPageTime);
    }
}

function downloadInstallerListJS() {
    if (Config_MultiDownload) {
        var url = installParams["DOWNLOAD_URL"];
        var downloadFile = appExternal.getResourceLocation() + "config\\" + getFilename(url);
        appExternal.updateInstallerList(url, downloadFile, false, false, downloadCallback);
    } else {
        setTimeout(Navigator.nextPage, Feature_ShowPageTime);
    }
}

function checkPrerequisite() {
    var regKey = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full";
	var regValue = "Release";
    var regData = getDataFromReg(regKey, regValue);
    // Requires at least .Net 4.0
    if (!isValidAndNotEmpty(regData)) {
        appExternal.setProperty("skip_prerequisite_page","false");
        appExternal.setProperty("dotNetRequirements", "true");
    } else {
        appExternal.setProperty("skip_prerequisite_page","true");
        appExternal.setProperty("dotNetRequirements", "false");
    }
}




function initialize () {
    
    initializeDefaultLang();
    setTextToPage();

    if(Feature_IsBillBoardsEnabled){
        var billboardImages = BillboardController.getBillboardImages("initialization");
        BillboardController.init(billboardImages);
        BillboardController.startSwitch(Feature_BillboardSwitchInterval);
    }

    if (Feature_IsISO) {
        appExternal.setProperty("isISO", "true");
    } else {
        appExternal.setProperty("isISO", "false");
    }

    if(Config_CheckPrerequiste) {
       checkPrerequisite();
    }

    startLoading();
    downloadInstallerListJS();
}

$(document).ready(function(){
    $("#close").click(function () {
        trackUserActivity("Initialization_Close");
        notifyFinalStatus(Config_Status.CANCEL);
        closeApp();
    });

    initialize();
});
