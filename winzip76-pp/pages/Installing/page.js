var clockTime = 200;
var isISO;
var isDownload64;
var resumeMode;
var Status = Config_Status.COMPLETED;
var isRestart = false;
var rebootAtEnd = false;

function startProgress() {
    function progressing() {
        // set progress bar
        var current = Config_ProgressItem.CurrentProcess;
        if (current == 0) {
            return;
        }
        // note: reset last process
        if (current < Config_ProgressItem.LastProcess) {
            Config_ProgressItem.LastProcess = current;
        }

        // set downloading filenmae
        var filename = getFilename(Jobs.getCurrentFile()["name"]);
        InstallProgress.setLabel('.installing_filename', getMultiText("InstallingText") + " " + filename);

        var total = Config_ProgressItem.TotalProgress;
        var installedTime = Jobs.getIntalledTime(Jobs.getJobID(), Jobs.getComponentID());
        var proportion = Jobs.getComponentTime() * 1.0 / Jobs.getJobTime();
        var installedProprotion = installedTime * 1.0 / Jobs.getJobTime();
        var val = parseInt(current * 100 / total * proportion + 100 * installedProprotion);
        var completeText = getMultiText("complete").replace("%d%",val.toFixed(0));
        InstallProgress.setLabel('.progressLabel', completeText);
        InstallProgress.setValue(val);
        // different size in 1 sec
        var diffSize = parseInt(((current - Config_ProgressItem.LastProcess) * 1.0 / total * Jobs.getComponentTime()) * (1000.0 / clockTime));
        // set estimated time
        var lastSize = parseInt(Jobs.getJobTime() - installedTime - current * 1.0 / total * Jobs.getComponentTime());
        var lastTime = getFormatTime(diffSize != 0 ? lastSize / diffSize : lastSize);
        InstallProgress.setLabel(".estimatedTime", getMultiText("EsimatedTimeText") + " " + lastTime);

        Config_ProgressItem.LastProcess = current;
    }
    function callback() {
        // note: the progress is 100%, do next job
        if (Jobs.getJobID() < Jobs.getJobLength()) {
            InstallProgress.start(progressing, clockTime, callback);
        }
    }
    InstallProgress.start(progressing, clockTime, callback);
}

function installing(url, fileName, param, estimatedTime) {
    var installFile;
    if (isISO) {
        installFile = appExternal.getCurrentPath() + "\\";
    } else {
        installFile = appExternal.getProperty("downloadPath");
        if (installFile[installFile.length - 1] === '/' || installFile[installFile.length - 1] === '\\') {
            installFile += fileName;
        } else {
            installFile += "\\" + fileName;
        }
    }
    installFile = installFile.replace(/\//g, "\\");

    var component = Jobs.getCurrentComponent();
    if (component["name"].indexOf("MainContent") >= 0) {
        var result = appExternal.prepareInstall(installFile);
        if (result == 0) {
            // winzip normal install.
            appExternal.install(installFile, param, estimatedTime, installCallback);
        } else if (result == 1) {
            // winzip has been installed.
            Status = Config_Status.COMPLETED;
            appExternal.setProperty("Config_Status", Status.toString());
            Navigator.nextPage();
        } else if (result == 2) {
            // winzip msi installer error.
            Status = Config_Status.ERROR;
            appExternal.setProperty("Config_Status", Status.toString());
            Navigator.nextPage();
        }
    }
    else {
        appExternal.install(installFile, param, estimatedTime, installCallback);
    }
}

function installCallback(result, total, current) {
    if (result === Config_ErrorHandle.Running) {
        Config_ProgressItem.CurrentProcess = current;
        Config_ProgressItem.TotalProgress = total;
        return;
    }

    var os = isDownload64 ? "64" : "32";
    var component = Jobs.getCurrentComponent();
    if (isValid(component) && isValidAndNotEmpty(component["name"])) {
        updateComponents(component["name"] + os);
    }

    if (result === Config_ErrorHandle.Reboot) {
        result = Config_ErrorHandle.NoError;
    }

    if (result !== Config_ErrorHandle.NoError) {
        if (result === Config_ErrorHandle.HaveInstalled) {
            Status = Config_Status.COMPLETED;
            Navigator.nextPage();
        } else {
            Status = Config_Status.ERROR;
            notifyFinalStatus(Status);
            var errorTitle = getMultiText("errorText");
            var errorText = getMultiText("errorMessageText").replace("%d", result.toString());
            var lastErrorCode = appExternal.getLastInstallError();
            // handle the last error code(5100) when installing .Net with not enough space.
            if (result === Config_ErrorHandle.DiskFull || lastErrorCode === 5100) {
                errorText = getMultiText("diskfullMessageText");
            } else if (result === Config_ErrorHandle.OtherInstalling) {
                errorText = getMultiText("retryMessageText");
            }

            appExternal.messageBox(errorText, errorTitle);
            closeAppWithError(result);
        }
    } else {
        var program = component["program"];
        // find program, this component is Main Application component
        if (isValidAndNotEmpty(program)) {
            var file = Jobs.getCurrentFile();
            var programFile, location = "";
            var reg = component["registry"];
            if (isValid(reg)) {
                location = getDataFromReg(reg["key"], reg["value"]);
            }
        
            if (location.length >= 3) {
                programFile = location;
                if (location[location.length - 1] == '\\' || location[location.length - 1] == '/') {
                    programFile = location + program;
                } 
                // set launch program
                appExternal.setProperty("startProgram", programFile);
                // enable launch
                // ButtonConttoller.enableBtn("#launch");
            }
        }
        if (isValid(Jobs.getNextFile())) {
            // note: before download next file, should reset process first.
            Config_ProgressItem.CurrentProcess = 0;
            Config_ProgressItem.TotalProgress = 1;
            downloadNext();
        } else {
            Status = Config_Status.COMPLETED;
            appExternal.setProperty("Config_Status", Status.toString());

            setTimeout(function () {
                Navigator.nextPage();
            }, 3000);
        }
    }
}

function installNext() {
    Config_Steps.Current = Config_Steps.Install;
    var component = Jobs.getCurrentComponent();
    var file = Jobs.getCurrentFile();
    var param = "", estimatedTime = 1;
    var canInstall = false;
    while (isValid(file)) {
        if (isValid(file["param"])) { // if 'param' is defined, means it's a installer file
            var extension = getFileExtension(file["name"]).toLowerCase();
            // get install parameter
            if (extension === ".msi") {
                var installPath = appExternal.getProperty("installPath");
                if (isValidAndNotEmpty(installPath)) {
                    param = file["param"] + " INSTALLDIR=\"" + installPath + "\"";
                } else {
                    param = file["param"];
                }
            } else {
                // if .exe and .zip want to set InstallDir, should pass parameter to installer, 
                // for example “param” : “InstallDir=\”${installPath}\””, and “installPath” is a property set by setProperty function, 
                // if it doesn’t exist, please use setParameterProperty function in page.js of “Installing” page to set it.
                param = file["param"];
            }
            // if (isValidAndNotEmpty(installParams["EXE_PARAMETERS"])) {
            //     param = param + " " + installParams["EXE_PARAMETERS"] + " /qn";
            // }
            // replace wildcard in param
            // the param can be "/L ${LANG_ID}", and the LANG_ID should be set by user
            param = replaceParams(param);
            if (!isValid(param)) {
                param = "";
            }

            if (isValid(component["estimatedTime"])) {
                estimatedTime = parseInt(component["estimatedTime"]);
            }
            canInstall = true;
            break;
        }
        file = Jobs.getNextFile();
        component = Jobs.getCurrentComponent();
    }

    if(!canInstall) {
        installCallback(Config_ErrorHandle.NoError);
    } else {
        installing(file["url"], file["name"], param, estimatedTime);
    }

    var paramArray = param.split(" ");
    for (var i = 0; i < paramArray.length; ++i) {
        // after installing, get VID from parameter list and set vid property
        if (paramArray[i].indexOf("VID=") == 0) {
            appExternal.setProperty("vid", paramArray[i].substring(4));
        }
    }
}

function install() {
    var isSkip;
    var isSkipInstalled = appExternal.getProperty("IsSkipInstalled");
    if (isValidAndNotEmpty(isSkipInstalled)) {
        isSkip = isSkipInstalled === "true" ? true : false;
    } else {
        // Installers install in silent mode usually
        // If can't find the 'IsSkipInstalled' property, skip to install installed component.
        isSkip = true; 
    }

    Jobs.setJobs(Config_MultiDownload, isSkip, isRestart);

    if (Jobs.getJobLength() > 0) {
        Jobs.setIntalledTime();
        installNext();
    } else if (isRestart) {
        Navigator.nextPage();
    } else {
        if (isSkip) {
            installCallback(Config_ErrorHandle.HaveInstalled, 1, 0);
        } else {
            installCallback(Config_ErrorHandle.FileNotExist, 1, 0);
        }
    }
}

function  initialize () {
    /* init buttons */
    ButtonConttoller.disableBtn("#launch");
    if(Feature_LaunchApplicationButton === "Disable"){
        $(".button_area").hide();
    }

    /* init properties */
    resumeMode = appExternal.getResumeMode();
    if (resumeMode == Config_ResumeMode.INSTALLING || resumeMode == Config_ResumeMode.DOWNLOADING) {
        appExternal.showWindow();
        isRestart = true;
        if (resumeMode == Config_ResumeMode.INSTALLING) {
            resume(); // resume all useful data after reboot
        }   
    }

    setTextToPage();

    isISO = appExternal.getProperty("isISO") == "true" ? true : false;

    if(Feature_IsBillBoardsEnabled){
        var billboardImages = BillboardController.getBillboardImages("installing");
        BillboardController.init(billboardImages);
        BillboardController.startSwitch(Feature_BillboardSwitchInterval);
    }

    if(!Feature_CheckingProgressBar){
        $("#install_panel").hide();
    }

    isDownload64 = appExternal.getProperty("isDownload64") == "true" ? true : false;

    // New page, clear status property
    appExternal.setProperty("Config_Status", "");

    setParameterProperty();
}

// set property for param, use for installing
function setParameterProperty () {
    //getSelectLang();
}

// $(document).ready(function () {
    
//     $("#close").click(function () {
//         trackUserActivity("Installing_Close");
//         var status = appExternal.getProperty("Config_Status");
//         if (isValidAndNotEmpty(status)) { 
//             status = parseInt(status);
//         } else {
//             status = Config_Status.CANCEL;
//         }
//         notifyFinalStatus(status);
//         closeApp();
//     });

//     $("#launch").click(function () {
//         trackUserActivity("Installing_Launch");
//         var launchPath = appExternal.getProperty("startProgram");
//         if (isValidAndNotEmpty(launchPath))
//             appExternal.startProgram(launchPath, "");
//     });

//     initialize();
//     startProgress();
//     install();
// });