var IsResumeDownload;
var clockTime = 500;
var Status = Config_Status.DOWNLOADED;
var IsSkipDownloadPage = false;
var isRestart = false;
var isInstallDotNet = false;

function startProgress() {
    function progressing() {
        // set progress bar
        var progressbar = $("#progressbar");
        var progressLabel = $(".progress-label");
        var downloadingName = $(".downloading-name");
        var isDotNetProgress = false;

        // set downloading component name
        if (isValidAndNotEmpty(Jobs.getCurrentComponent()) && isValidAndNotEmpty(Jobs.getCurrentComponent()["name"])) {
            isDotNetProgress = !(Jobs.getCurrentComponent()["name"] == "MainContent");
            var componentName = isDotNetProgress ? getMultiText("downloadingDotNet") : getMultiText("downloadingWinZip");
            downloadingName.text(componentName);
        }

        if (Config_Steps.Current == Config_Steps.Install){
            progressLabel.text(getMultiText("installLabel"));
            if (!isInstallDotNet && isDotNetProgress) {
                InstallProgress.startLoading();
                isInstallDotNet = true;
                progressbar.progressbar("value", 0);
            } else if (!isDotNetProgress) {
                progressbar.progressbar("value", 99);
            }
            return;
        }
        if (isInstallDotNet) {
            InstallProgress.endLoading();
            isInstallDotNet = false;
        }
        var current = Config_ProgressItem.CurrentProcess;
        if (current == 0) {
            return;
        }
        // note: reset last process
        if (current < Config_ProgressItem.LastProcess) {
            Config_ProgressItem.LastProcess = current;
        }

        var totalFormated = strFormatByteSize(Jobs.getJobSize());
        var total = Config_ProgressItem.TotalProgress;
        var downloadedSize = Jobs.getDownloadedSize(Jobs.getJobID(), Jobs.getComponentID(), Jobs.getFileID());

        // set downloas size
        var currentFormated = strFormatByteSize(current + downloadedSize);
        

        var proportion = Jobs.getFileSize() * 1.0 / Jobs.getJobSize();
        var downloadedProportion = downloadedSize * 1.0 / Jobs.getJobSize();
        var val = parseInt(current * 100 / total * proportion + 100 * downloadedProportion);
        //var completeText = getMultiText("complete").replace("%d%",val.toFixed(0));
        //InstallProgress.setLabel('.progress-value', completeText);
        //InstallProgress.setValue(val);
        progressbar.progressbar("value", val);

        // different size in 1 sec
        var diffSize = parseInt(1000.0 / clockTime * (current - Config_ProgressItem.LastProcess));
        // get download speed for 1 sec
        var speed = strFormatByteSize(diffSize);
        //InstallProgress.setLabel('.progress-label', currentFormated + getMultiText("outOfText") + totalFormated + " @ " + speed + "/s");
        progressLabel.text(currentFormated + getMultiText("outOfText") + totalFormated + " @ " + speed + "/s");

        // set estimated time
        //var lastSize = Jobs.getJobSize() - downloadedSize - current;
        //var lastTime = getFormatTime(diffSize != 0 ? lastSize / diffSize : lastSize);
        //InstallProgress.setLabel(".estimatedTime", getMultiText("EsimatedTimeText") + " " + lastTime);

        // set destination path
        //InstallProgress.setLabel('.destination', getMultiText("DestinationText") + " " + appExternal.getProperty("downloadPath"));

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

function strFormatByteSize(size) {
    if (size < 1000) {
        return size.toFixed(2) + "B";
    }
    size = size / 1024;
    if (size < 1000) {
        return size.toFixed(2) + "KB";
    }
    size = size / 1024;
    if (size < 1000) {
        return size.toFixed(2) + "MB";
    }
    size = size / 1024;
    return size.toFixed(2) + "GB";
}

function downloadCallback(result, total, current) {
    if (result === Config_ErrorHandle.Running) {
        Config_ProgressItem.CurrentProcess = current;
        Config_ProgressItem.TotalProgress = total;
        return;
    }

    if (result === Config_ErrorHandle.Abort){
        notifyFinalStatus(Config_Status.CANCEL);
        InstallProgress.stop();
        return;
    }

    if (result !== Config_ErrorHandle.NoError) {
        if (result === Config_ErrorHandle.HaveInstalled) {
            Status = Config_Status.COMPLETED;
            Navigator.nextPage();
            return;
        } 
        
        var errorTitle = getMultiText("errorText");
        var errorText = getMultiText("errorMessageText").replace("%d", result.toString());
        if (result === Config_ErrorHandle.DiskFull) {
            errorText = getMultiText("diskfullMessageText");
        } else if (result === Config_ErrorHandle.NoNetwork) {
            errorText = getMultiText("noNetwork");
        }

        notifyFinalStatus(Config_Status.ERROR);
        appExternal.messageBox(errorText, errorTitle);
        closeAppWithError(result);
    } 
    if (result === Config_ErrorHandle.NoError) {
        Status = Config_Status.DOWNLOADED;
        appExternal.setProperty("Config_Status", Status.toString());
        $(".progress-label").text(getMultiText("installLabel"));
        installNext();
    }
}

function downloadNext() {
    Config_Steps.Current = Config_Steps.Download;
    var file = Jobs.getCurrentFile();
    if (isValid(file)) {
        var crc = "";
        if (Feature_IsCrcCheck){
            if(Config_MultiDownload && isValid(file["crc"])){
                crc = file["crc"];
            } else {
                crc = installParams["CRC"];
            }
        }

        var component = Jobs.getCurrentComponent();
        if (component["name"].indexOf("MainContent") >= 0) {
            downloading(file["url"], file["name"], crc, Feature_IsSecureDownload, IsResumeDownload);
        } else {
            downloading(file["url"], file["name"], crc, Feature_IsSecureDownload, false);
        }
    } else {
        downloadCallback(Config_ErrorHandle.FileNotExist, 0, 0);
    }
}


function downloading(url, fileName, crc, isSecure, isResume) {   
    var downloadDirectory = appExternal.getProperty("downloadPath");
    var downloadFile = appExternal.getProperty("downloadPath");
    if (downloadFile[downloadFile.length - 1] === '/' || downloadFile[downloadFile.length - 1] === '\\') {
        downloadFile += fileName;
    } else {
        downloadFile += "\\" + fileName;
    }
    var subPath = "";
    if(isValid(fileName)){
        var pos = fileName.lastIndexOf("/");
        if (pos != -1) {
            subPath = fileName.substring(0, pos);
            downloadDirectory = downloadDirectory + "\\" + subPath.replace("/", "\\");
        }
    }

    if(!isFileExist(downloadDirectory)){
        createDirectory(downloadDirectory);
    }
    
    downloadFile = downloadFile.replace(/\//g, "\\");
    appExternal.download(url, downloadFile, crc, isSecure, isResume, downloadCallback);
}

function download() {
    var isSkip = appExternal.getProperty("IsSkipInstalled") === "true" ? true : false;

    Jobs.setJobs(Config_MultiDownload, isSkip, isRestart);

    if (Jobs.getJobLength() > 0) {
        Jobs.setDownloadSize();

        if (IsSkipDownloadPage) {
            // Add disk space check code
            var avaSpace = getAvailableSpace(appExternal.getProperty("downloadPath"));   
            var reqSpace = Jobs.getTotalJobSize() - Jobs.getAllDownloadedSize();
            if(reqSpace > avaSpace) {
                notifyFinalStatus(Config_Status.ERROR);
                appExternal.messageBox(getMultiText("diskfullMessageText"), getMultiText("errorText"));
                closeAppWithError(Config_ErrorHandle.DiskFull);
            }
        }

        downloadNext();
    } else {
        if (isSkip) {
            downloadCallback(Config_ErrorHandle.HaveInstalled, 1, 0);
        } else {
            downloadCallback(Config_ErrorHandle.FileNotExist, 1, 0);
        }
    }
}

function preDownlaodingInit() {

    if (!isValidAndNotEmpty(appExternal.getProperty("downloadPath"))) {
        var downloadPath;
        if (Feature_DownloadDirMode === "Desktop") {
            downloadPath = appExternal.getDesktopPath();
        } else if (Feature_DownloadDirMode === "Current") {
            downloadPath = appExternal.getCurrentPath();
        } else if (Feature_DownloadDirMode === "Temp") {
            downloadPath = appExternal.getTempPath("");
        } else {
            downloadPath = Feature_DefaultDownloadDir;
        }
        appExternal.setProperty("downloadPath", downloadPath);
    }

    appExternal.setProperty("IsSkipInstalled", "false");
    
    if (is64bitOS()) {
        appExternal.setProperty("isDownload64", "true");
    } else {
        appExternal.setProperty("isDownload64", "false");   
    }
}

function initialize () {
    /* init buttons */
    if(Feature_DownloadMode === "Simple" && !Feature_IsCrcCheck){
        $("#start_and_pause").hide();
    }

    /* init properties */
    resumeMode = appExternal.getResumeMode();
    if (resumeMode == Config_ResumeMode.DOWNLOADING) {
        isRestart = true;
        resume(); // resume all useful data after reboot
        if(!Config_MultiDownload){
            var osbits = "32";
            if(appExternal.getProperty("isDownload64") =="true"){
                osbits = "64";
            }
            var downloadUrl = replaceParams(installParams["DOWNLOAD_URL"]);
        }
    }

    // should not download components in ISO mode
    if (appExternal.getProperty("isISO") == "true") {
        Navigator.nextPage();
        return false;
    }

    if(Feature_IsBillBoardsEnabled){
        var billboardImages = BillboardController.getBillboardImages("downloading");
        BillboardController.init(billboardImages);
        BillboardController.startSwitch(Feature_BillboardSwitchInterval);
    }

    IsResumeDownload = Feature_DownloadMode == "ResumableSimple" ? true : false;

    if(!Feature_CheckingProgressBar){
        $("#download_panel").hide();
    }

    if (Feature_IsDestinationHide) {
        $(".destination").hide();
    }

    return true;
}


$(document).ready(function () {

    preDownlaodingInit()

    if (initialize()) {
        setTextToPage();
        startProgress();
        download();
    }

    $("#close").click(function () {
        trackUserActivity("Downloading_Close");
        var status = appExternal.getProperty("Config_Status");
        if (isValidAndNotEmpty(status)) {
            status = parseInt(status);
        } else {
            status = Config_Status.CANCEL;
        }
        notifyFinalStatus(status);
        closeApp();
    });

    $("#start_and_pause").click(function () {
        var text = $(this).attr('text');
        if (text === "StartButtonText") {
            trackUserActivity("Downloading_Start");
            startProgress();
            download();
            text = "PauseButtonText";
        } else {
            trackUserActivity("Downloading_Pause");
            appExternal.stopDownload();
            text = "StartButtonText";
        }
        var propText = getMultiText(text);
        $(this).html(propText);
        $(this).attr('text', text);
    });

    $("#destination").text(function() {
        return getMultiText("DestinationText") + appExternal.getProperty("downloadPath");
    });
});