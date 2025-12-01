var Navigator = {
    getIndex: function (name) {
        for (var i = 0; i < Config_SequencePages.length; ++i) {
            if (Config_SequencePages[i] == name) {
                return i;
            }
        }
        return -1;
    },

    currentPageIndex: function () {
        var title = $(document).attr("title");
        return Navigator.getIndex(title);
    },

    nextPage: function () {
        var index = Navigator.currentPageIndex();
        if (index >= 0 && index < Config_SequencePages.length - 1) {
            var currentPage = Config_SequencePages[index];
            var nextPage = Config_SequencePages[index + 1];
            if(nextPage === "Prerequisite" && isSkipPrerequisitePage()) {
                nextPage = Config_SequencePages[index + 2];
            }
            var location = "../" + nextPage + "/page.html";
            Navigator.goPage(location);
        } else { // can't find page, close app
            closeApp();
        }
    },

    previousPage: function () {
        var index = Navigator.currentPageIndex();
        if (index >= 1 && index < Config_SequencePages.length){
            var previousPage = Config_SequencePages[index - 1];
            if(previousPage === "Prerequisite" && isSkipPrerequisitePage()) {
                previousPage = Config_SequencePages[index - 2];
            }
            var location = "../" + previousPage + "/page.html";
            Navigator.goPage(location);
        } else {
            closeApp();
        }
    },

    firstPage: function () {
        var title = $(document).attr("title");
        if (title == "Load") {
            var first = "pages/" + Config_SequencePages[0] + "/page.html";
            Navigator.goPage(first);
        } else {
            closeApp();
        }
    },

    goSpecifiedPage: function(title) {
        var index = Navigator.getIndex(title);
        if (index >= 0 && index < Config_SequencePages.length) {
            var location;
            if ($(document).attr("title") == "Load") {
                location = "pages/" + Config_SequencePages[index] + "/page.html";
            } else {
                location = "../" + Config_SequencePages[index] + "/page.html";
            }
            Navigator.goPage(location);
        } else {
            closeApp();
        }
    },

    gotoUpdatePage: function() {
        var location = "pages/SelfUpdate/page.html";
        window.location.href = location;
    },

    goPage: function (page) {
        window.location.href = page;
    }
};

var InstallProgress = {
    processTimer : 0,
    val : 0,
    loadTimer : 0,
    loadStart : -116,
    loadEnd : 530,
    isFinished : false,
    callback : function() {},
    setLabel : function(label, string) {
        $(label).text(string);
    },
    setValue : function(val) {
        InstallProgress.val = val;
        if (val == 100) {
            clearInterval(InstallProgress.processTimer);
            InstallProgress.isFinished = true;
            InstallProgress.callback();
        } else {
            InstallProgress.isFinished = false;
        }
    },

    start : function(progressing, clockTime, callback) {
        InstallProgress.callback = callback;
        InstallProgress.isFinished = false;
        InstallProgress.processTimer = setInterval(progressing, clockTime);
    },

    stop : function(){
        clearInterval(InstallProgress.processTimer);
    },

    startLoading: function () {
        $(".progress-marquee").css({"background-color": "#557cb8"});
        var p = InstallProgress.loadStart;
        function loading() {
            p += 3;
            if (p > InstallProgress.loadEnd) {
                p = InstallProgress.loadStart;
            }
            $(".progress-marquee").css("left", p + "px");
        }
        InstallProgress.loadTimer = setInterval(loading, 10);
    },
    endLoading: function () {
        $(".progress-marquee").remove();
        clearInterval(InstallProgress.loadTimer);
    }
};

var BillboardController={
    index : 0,
    max : 0,
    timer : 0,
    titles :[],
    callback : function(i) {},
    init : function(images) {
        BillboardController.max = images.length;
        $.each(images, function(i, image){
            BillboardController.titles.push(image[0]);
            var id = "billboards"+i;
            var img = '<img id="'+id+'" src="'+image[1]+'"/>';
            if (i != BillboardController.index) {
                img = $(img).hide();
            }
            $(".billboard_image_area").append(img);
        });

        BillboardController.callback = function(i){
            var title = getMultiText(BillboardController.titles[i]);
            if(!title){
                title = BillboardController.titles[i];
            }
            $(".billboardName").text(title);
        };

        var startTitle = getMultiText(BillboardController.titles[0]);

        $(".billboardName").text(!startTitle ? BillboardController.titles[0] : startTitle);
    },
    getBillboardImages: function(pageType){
        var billboardImages = [];
        var imageBasePath = "..\\..\\common\\img\\billboards\\";
        var index=1;
        while(true){
            var imageTitleAndPath = [];
            var title = "billboardTitle" + index;
            imageTitleAndPath.push(title);
            var path = imageBasePath + "billboards" + index +".png";
            if(HdpiController.isHighDpi()){
                path = imageBasePath + "billboards" + index + "_hdpi.png";
                if(!imageExists(pageType + "\\" + path)){
                    path =imageBasePath + "billboards" + index +".png";
                }
            }
            if(!imageExists(pageType + "\\" + path)){
                break;
            }
            imageTitleAndPath.push(path);
            billboardImages.push(imageTitleAndPath);
            index++;
        }
        return billboardImages;
    },
    switchToNext : function() {
        var id = "#billboards";
        var i = BillboardController.index;
        var nextI = (i + 1) % BillboardController.max;
        $(id + i).fadeOut(800);
        $(id + nextI).fadeIn(800);
        BillboardController.index = nextI;
        BillboardController.callback(nextI);
    },
    startSwitch : function(interval) {
        function switchToNext() {
            BillboardController.switchToNext();
        }
        clearInterval(BillboardController.timer);
        BillboardController.timer = setInterval(switchToNext, interval);
    },
    stopSwitch : function() {
        clearInterval(BillboardController.timer);
    }
};

var HdpiController = {
    isHighDpi : function() {
        var dpi = window.devicePixelRatio;
        return dpi >= 1.5;
    },
    initImg : function() {
        var isHdpi = HdpiController.isHighDpi();
        $(".hdpiImage").each(function(){
            var name = $(this).attr("name");
            var type = $(this).attr("type");
            if (isHdpi) {
                name = name + "_hdpi";
            }
            $(this).attr("src", name + "." + type);
        });
    }
};

var ButtonConttoller = {
    disableBtn : function(className) {
        $(className).prop("disabled", "true");
        $(className).removeClass("Initiator");
    },
    enableBtn : function(className) {
        $(className).addClass("Initiator");
        $(className).removeProp("disabled");
    }
};

/* ======================== utils functions ========================*/

function dragWindow(element) {
    if (window.event.srcElement === element) {
        appExternal.dragWindow();
    }
}

function is64bitOS () {
    return appExternal.getProperty("osbits") == "64";
}

function trackUserActivity(activity){
    appExternal.trackUserActivity(activity);
}

function trackingByAnalyticsSDK(activity, properties){
    appExternal.trackingByAnalyticsSDK(activity, properties);
}

function hide() {
    appExternal.hideWindow();
}

function minimized() {
    appExternal.minimizedWindow();
}

function closeApp() {
    trackingInstallCompletedStatus();
    appExternal.closeWindow();
}

function closeAppWithError(error) {
    trackingInstallErrorStatus(error);
    appExternal.closeWindow();
}

function trackingInstallCompletedStatus() {
    // track install completed success and cancel event
    var status = appExternal.getProperty("Config_Status");
    if (status == Config_Status.COMPLETED)
    {
        // track install completed success event
        trackingByAnalyticsSDK("install.completed", "install.completed=OK");
    }
    else if (status == Config_Status.CANCEL)
    {
        // track install completed user canceled event
        trackingByAnalyticsSDK("install.completed", "install.completed=CNX|install.fail-reason=UserCanceled");
    }
    else if (status == Config_Status.ENVIRONMENT_NOT_MEET)
    {
        // track install completed enviroment error
        trackingByAnalyticsSDK("install.completed", "install.completed=NOK|install.fail-reason=EnviromentNotMeet");
    } 
    else
    {
        // track install completed other error
        trackingByAnalyticsSDK("install.completed", "install.completed=NOK|install.fail-reason=UnknowError");
    }
    
}

function trackingInstallErrorStatus(result) {
    // track install completed error event
    var reason = "UnknowError";
    if (result == Config_ErrorHandle.FileNotExist)
    {
        reason = "FileNotExist"
    }
    else if (result == Config_ErrorHandle.DiskFull)
    {
        reason = "DiskFull"
    }
    else if (result == Config_ErrorHandle.Failure)
    {
        reason = "Failure"
    }
    else if (result == Config_ErrorHandle.Md5Error)
    {
        reason = "Md5Error"
    }
    else if (result == Config_ErrorHandle.VolumeReadOnly)
    {
        reason = "VolumeReadOnly"
    }
    else if (result == Config_ErrorHandle.NoNetwork)
    {
        reason = "NoNetwork"
    }
    else if (result == Config_ErrorHandle.HaveInstalled)
    {
        reason = "HaveInstalled"
    }
    else if (result == Config_ErrorHandle.OtherInstalling)
    {
        reason = "OtherInstalling"
    }

    trackingByAnalyticsSDK("install.completed", "install.completed=NOK|install.fail-reason=" + reason);
}

function notifyFinalStatus(status) {
    appExternal.setInstallStatus(status);
    appExternal.setProperty("Config_Status", status.toString());
}

function getSourceID(serialKey){
    var sourceID = appExternal.getSourceID(serialKey);
    return sourceID;
}

function  getDataFromReg (key, value) {
    var data = "";
    if (isValidAndNotEmpty(key)) {
        data = appExternal.getDataFromReg(key, value);
    }
    return data;
}

function splitStr(str, filter) {
    var splits = str.split(filter);
    return splits;
}

function environmentCheck() {
    initializeDefaultLang();
    var osVersion = splitStr(appExternal.getOSVersionAndBuildNumber(), ".");
    // OS at least Windows 10 10.0.17134.
    if (parseInt(osVersion[0]) < 10 || (parseInt(osVersion[0]) == 10 && parseInt(osVersion[1]) < 0) || (parseInt(osVersion[0]) == 10 && parseInt(osVersion[1]) == 0 && parseInt(osVersion[2]) < 17134)) {
        appExternal.messageBox(getMultiText("osRequirements"), getMultiText("errorText"));
        return false;
    }

    regKey = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Internet Explorer";
    regValue = "Version";
    var regData = getDataFromReg(regKey, regValue);
    var ieVersion = splitStr(regData, ".");
    // Requires at least IE 8
    if (ieVersion[0] < 8) {
        appExternal.messageBox(getMultiText("ieRequirements"), getMultiText("errorText"));
        return false;
    }

    // Requires at least .Net 3.5
    var regKey = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full";
    var regValue = "Release";
    var regKey35 = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v3.5";
    var regValue35 = "Version";
    var regData = getDataFromReg(regKey, regValue);
    var regData35 = getDataFromReg(regKey35, regValue35);
    if (!isValidAndNotEmpty(regData) && !isValidAndNotEmpty(regData35)) {
        appExternal.messageBox(getMultiText("dotNet35Requirements"), getMultiText("errorText"));
        return false;
    }

    // Requires 64-bit system
    if (!is64bitOS()) {
        appExternal.messageBox(getMultiText("osBitRequirements"), getMultiText("errorText"));
        return false;
    }

    // Require WebView2 runtime
    if (!appExternal.downloadAndInstallWV2RT()) {
        appExternal.messageBox(getMultiText("webview2InstallFail"), getMultiText("errorText"));
        return false;
    }

    return true;
}

function setProductProperty() {
    appExternal.setChannel(installParams["CHNL"]);
    appExternal.setProperty("__Extract_In_Download__", Config_ExtractInDownload ? "true" : "false");
}

function imageExists(relativePath){
    var path = appExternal.getResourceLocation() + "pages\\" + relativePath;
    return appExternal.isFileExists(path);
}

function getSKU(){
    var serialNumber = appExternal.getSavedSerialNumber();
    var sourceID = getSourceID(serialNumber);
    var sku = Config_SourceIDMapping[sourceID];
    if (!isValidAndNotEmpty(sku)) {
        for (var s in Config_SourceIDMapping) {
            sku = Config_SourceIDMapping[s];
            break;
        }
    }
    return sku;
}

function isValid(obj) {
    if (obj == null || obj == undefined)
        return false;
    return true;
}
function isValidAndNotEmpty (obj) {
    if (!isValid(obj) || obj == "")
        return false;
    return true;
}

function getFilename(path) {
    if (!isValidAndNotEmpty(path)) {
        return "";
    }

    var pos = path.lastIndexOf("/");
    if (pos == -1) {
        pos = path.lastIndexOf("\\");
    }
    return path.substring(pos + 1);
}

function getFilePath(path) {
    if (!isValidAndNotEmpty(path)) {
        return "";
    }

    var pos = path.lastIndexOf("/");
    if (pos == -1) {
        pos = path.lastIndexOf("\\");
    }
    return path.substring(0, pos);
}

function getFileExtension(path) {
    if (!isValidAndNotEmpty(path)) {
        return "";
    }

    var pos = path.lastIndexOf(".");
    if (pos != -1)
        return path.substring(pos);
    else
        return "";
}

function  getFormatTime (lastTime) {
    var hour = 0, minute = 0, second = parseInt(lastTime);
    if (second >= 60) {
        minute = parseInt(second/60);
        second = second - minute * 60;
    }
    if (minute >= 60) {
        hour = parseInt(minute/60);
        minute = minute - hour*60;
    }
    if (hour > 99) {
        hour = 99;
    }
    var result = "";
    if (hour < 10) {
        result += "0";
    }
    result += hour + ":";
    if (minute < 10) {
        result += "0";
    }
    result += minute + ":";
    if (second < 10) {
        result += "0";
    }
    result += second;
    return result;
}

function isEmpty(a) {
    return a === undefined || a === null || (!$.isFunction(a) && a.length === 0);
}

function getFormatSize(fileSize) {
    var size = parseInt(fileSize);
    var result = size + getMultiText("Byte");
    if (size >= 1024) {
        size /= 1024;
        result = size.toFixed(2) + getMultiText("KB");
    }
    if (size >= 1024) {
        size /= 1024;
        result = size.toFixed(2) + getMultiText("MB");
    }
    if (size >= 1024) {
        size /= 1024;
        result = size.toFixed(2) + getMultiText("GB");
    }
    return result;
}

function validatePath(path) {
    return appExternal.isFileExists(path) || appExternal.createDirectory(path);
}

function getAvailableSpace(path) {
    return isEmpty(path) || path.length < 3 ? 0
        : parseInt(appExternal.getDiskAvailableSpace(path));
}

function isSkipCheckUpdate(){
    var update_url = $.trim(installParams["UPDATE_STUB_URL"]);
    if (update_url === '' || update_url === undefined || update_url === null ){
        return true;
    }
    return appExternal.isSkipSelfUpdate();
}

function isSilentlyLaunch(){
    return appExternal.isSilentLaunchStub();
}


function openThankYouPage(userInstallParams){
    var url;
    if (userInstallParams) {
        url = replaceParams(installParams["TYP_URL"]);
    } else {
        url = getMultiText("TYP_URL");
    }
    var ret = false;
    if (url !=="" && url !== !null)
    {
        ret = appExternal.openPage(url);
    }
    return ret;
}

function createDirectory(directory){
    return appExternal.createDirectory(directory);
}

function isFileExist(path){
    return appExternal.isFileExists(path);
}

// str can contain ${XXX}, ${YYY} .etc.
// and the property gets from appExternal should be XXX, YYY...
// user can set property by appExternal.setProperty()
function replaceParams(str) {
    var result = str;
    var tokens = str.match(/\$\{([a-z]|[A-Z]|[0-9]|_)*\}/g);
    if (tokens != null) {
        $.each(tokens, function (index, token) {
            var propertyName = token.substr(2, token.length - 3);
            // concerning the langauge codes for the Nordic languages.
            if(propertyName === "lang") {
                var lang = getLanguage().toLowerCase();
                if(lang === "da") {
                    lang = "dk";
                } else if (lang === "sv") {
                    lang = "se";
                } else if (lang === "pt") {
                    lang = "bp";
                }
                result = result.replace(token, lang);
            } else {
                result = result.replace(token, appExternal.getProperty(propertyName));
            }
        });
    }
    return result;
}

function replaceText (label, str) {
    $(label).text(str);
}

function supportAnyDPI(width, height) {
    var ok = false;
    var rate = 1.0;
    while(!ok) {
        if ((screen.availWidth - 100) < width || (screen.availHeight - 100) < height) {
            rate *= 0.8;
            width = width * 4 / 5;
            height = height * 4 / 5;
        } else {
            ok = true;
        }
    }
    if (rate == 1.0) {
        rate = 0.9999; // should change scale rate in hdpi
    }

    document.documentElement.scrollLeft = 0;
    document.documentElement.scrollTop = 0;
    $("body").css("-ms-transform-origin", "top left");
    $("body").css("-ms-transform", "scale(" + rate + ")");

    return rate;
}

function isSkipPrerequisitePage() {
    return appExternal.getProperty("skip_prerequisite_page") === "true";
}


function resumePage(pageName, isMultiDownload) {

    function updateCallback(result, total, current) {
        if (result !== Config_ErrorHandle.Running) {
            Navigator.goSpecifiedPage(pageName);
        }
    }

    if (isMultiDownload) {
        appExternal.hideWindow();
        updateInstallerList(updateCallback);
    } else {
        Navigator.goSpecifiedPage(pageName);
    }
}

function updateInstallerList(callback) {
    var url = installParams["DOWNLOAD_URL"];
    var downloadFile = appExternal.getResourceLocation() + "config\\" + getFilename(url);
    appExternal.updateInstallerList(url, downloadFile, false, false, callback);
}

function getMajorVersion() {
    var version = installParams["DOWNLOAD_URL"];
    var pos = version.lastIndexOf("/");
    if (pos != -1)
    {
        var version = version.substring(0, pos);
        pos = version.lastIndexOf("/");
        if (pos != -1)
        {
            version = version.substring(pos + 1);
        }
    }
    return version;
}

/* ======================== Jobs for download and install ========================*/
var componentTemplate = {
    "group" : 0,
    "sku" : null,
    "type" : null,
    "name" : "MainContent",
    "registry" : {
        "key" : null,
        "value" : null
    },
    "program" : null,
    "estimatedTime" : 10,
    "files" : [
        {
            "name" : null,
            "param" : null,
            "size" : null,
            "installSize": null,
            "crc" : null
        }
    ]
};

var Jobs = {
    currentJobID : 0, // this id should from 0 to 1, 2...n
    currentComponentID : 0,
    currentFileID : 0,
    fileSize : 0,
    jobs : null,
    // use for download
    jobSize : null,
    downloadedSize : null,
    // use for install
    jobTime : null,
    installedTime : null,

    /************************************** common function **************************************/
    callback: function (group, current, total, result) {
        fileSize = total;
    },

    initSingleComponents: function(filter){
        var components = [];
        if (appExternal.getProperty("dotNetRequirements") == "true"){ // need to download .NET 4.6.
            components.push(Config_PrerequisteComponents[0]);
        }
        var downloadUrl = appExternal.getProperty("downloadUrl");
        if (!isValidAndNotEmpty(downloadUrl)) {
            downloadUrl = replaceParams(installParams["DOWNLOAD_URL"]);
        }
        appExternal.setProperty("downloadUrl", downloadUrl);
        var size = appExternal.getProperty("downloadSize");
        if (!isValidAndNotEmpty(size) || size <= 0) {
            var downloadFile = appExternal.getProperty("downloadPath") + "\\" + getFilename(downloadUrl);
            appExternal.initDownloadSize(downloadUrl, downloadFile, true);
            size = appExternal.getProperty("downloadTotal");
        }
        var component = componentTemplate;
        component["group"] = components.length;
        component["sku"] = "";
        component["type"] = ComponentType.X86 | ComponentType.X64 | ComponentType.MustSelect;
        component["program"] = Config_SingleDownload["program"];
        component["estimatedTime"] = Config_SingleDownload["estimatedTime"];
        component["registry"] = Config_SingleDownload["registry"];
        component["files"][0]["name"] = getFilename(downloadUrl);
        component["files"][0]["url"] = downloadUrl;
        component["files"][0]["param"] = installParams["EXE_PARAMETERS"] + " /qb!";
        component["files"][0]["size"] = parseInt(size);
        component["files"][0]["crc"] = "";
        appExternal.setProperty(component["name"] + filter, "true");

        components.push(component);

        return components;
    },

    setJobs : function(isMultiDownload, isSkipInstalled, isRestart) {
        Jobs.jobs = {};
        Jobs.jobSize = [];
        Jobs.downloadedSize = [];
        Jobs.jobTime = [];
        Jobs.installedTime = [];
        Jobs.currentFileID = 0;
        Jobs.currentComponentID = 0;
        Jobs.currentJobID = 0;
        Jobs.fileSize = 0;
        Jobs.installSize = 0;

        var filter, type;
        if (appExternal.getProperty("isDownload64") == "true") {
            filter = 64;
            type = ComponentType.X64;
        } else {
            filter = 32;
            type = ComponentType.X86;
        }

        var temp = {};
        var sku = getSKU();

        var installComponents = Jobs.initSingleComponents(filter);

        for (var i = 0; i < installComponents.length; ++i) {
            var component = installComponents[i];
            if ((!isMultiDownload ||component["sku"] === sku) &&
                ((component["type"] & type) !== 0 || (component["type"] & ComponentType.Prerequiste) !== 0)) {
                // check installed modules

                if (isSkipInstalled &&
                    ((component["type"] & ComponentType.Prerequiste) == 0 || !Config_CheckPrerequiste) || isRestart) {
                    var reg = component["registry"];
                    if (Jobs.getDataFromRegistry(reg)) {
                        // skip download or install installed component
                        appExternal.setProperty(component["name"] + filter, "false");
                        continue;
                    }
                }
                // add component
                if (isValid(component["files"])) {
                    // this component should be download or install
                    var compFilter = appExternal.getProperty(component["name"] + filter);
                    if ((!isRestart && (!isValidAndNotEmpty(compFilter) || // if skip download or install page
                        compFilter === "true")) ||
                        (isRestart && isValidAndNotEmpty(compFilter) && compFilter === "true")) { // If reboot, need to install the selected components
                        // init 'size' if 0
                        for (var f = 0; f < component["files"].length; ++f) {
                            var file = component["files"][f];
                            if (!isValidAndNotEmpty(file["size"]) || file["size"] <= 0) {
                                var downloadFile = appExternal.getProperty("downloadPath") + "\\" + file["name"];
                                var downloadPath = getFilePath(downloadFile);
                                var result = appExternal.createDirectory(downloadPath);
                                appExternal.initDownloadSize(file["url"], downloadFile, true);
                                file["size"] = parseInt(appExternal.getProperty("downloadTotal"));
                            }
                        }
                        // append component to jobs
                        var group = component["group"];
                        var job = [];
                        if (temp.hasOwnProperty(group)) {
                            job = temp[group];
                        }
                        job.push(component);
                        temp[group] = job;
                    }
                }
            }
        }
        // get job from temp
        var index = 0;
        for (var prop in temp) {
            Jobs.jobs[index++] = temp[prop];
        }
    },
    getCurrentJob : function () {
        if (Jobs.currentJobID < Jobs.getJobLength()) {
            return Jobs.jobs[Jobs.currentJobID];
        } else {
            return null;
        }
    },
    getCurrentComponent : function () {
        if (Jobs.currentJobID < Jobs.getJobLength() && Jobs.currentComponentID < Jobs.getComponentLength()) {
            return Jobs.jobs[Jobs.currentJobID][Jobs.currentComponentID];
        } else {
            return null;
        }
    },
    getCurrentFile : function () {
        if (Jobs.currentJobID < Jobs.getJobLength() && Jobs.currentComponentID < Jobs.getComponentLength() && Jobs.currentFileID < Jobs.getFileLength()) {
            return Jobs.jobs[Jobs.currentJobID][Jobs.currentComponentID]["files"][Jobs.currentFileID];
        } else {
            return null;
        }
    },

    getNextJob : function () {
        if (Jobs.currentJobID + 1 >= Jobs.getJobLength()) {
            return null;
        }
        Jobs.currentJobID++;
        Jobs.currentComponentID = 0;
        Jobs.currentFileID = 0;
        return Jobs.getCurrentJob();
    },
    getNextComponent : function () {
        if (Jobs.currentComponentID + 1 >= Jobs.getComponentLength()) {
            var job = Jobs.getNextJob();
            if (isValid(job)) {
                Jobs.currentComponentID = 0;
                Jobs.currentFileID = 0;
                return job[Jobs.currentComponentID];
            } else {
                return null;
            }
        }
        Jobs.currentComponentID++;
        Jobs.currentFileID = 0;
        return Jobs.getCurrentComponent();
    },
    getNextFile : function () {
        if (Jobs.currentFileID + 1 >= Jobs.getFileLength()) {
            var component = Jobs.getNextComponent();
            if (isValid(component)) {
                Jobs.currentFileID = 0;
                return component["files"][Jobs.currentFileID];
            } else {
                return null;
            }
        }
        Jobs.currentFileID++;
        return Jobs.getCurrentFile();
    },

    getJobLength : function () {
        var length = 0;
        for (var key in Jobs.jobs) {
            ++length;
        }
        return length;
    },
    getComponentLength: function () {
        if (Jobs.currentJobID < Jobs.getJobLength()) {
            return Jobs.jobs[Jobs.currentJobID].length;
        } else {
            return null;
        }
    },
    getFileLength : function () {
        if (Jobs.currentJobID < Jobs.getJobLength() && Jobs.currentComponentID < Jobs.getComponentLength()) {
            return Jobs.jobs[Jobs.currentJobID][Jobs.currentComponentID]["files"].length;
        } else {
            return null;
        }
    },

    getJobID : function () {
        return Jobs.currentJobID;
    },
    getComponentID : function () {
        return Jobs.currentComponentID;
    },
    getFileID : function () {
        return Jobs.currentFileID;
    },
    /************************************** install function **************************************/
    // should call setJobs first
    setIntalledTime : function () {
        for (var prop in Jobs.jobs) {
            var job = Jobs.jobs[prop];
            var total = 0;
            var installedComponentTime = [];
            installedComponentTime.push(total);
            for (var c = 1; c < job.length; ++c) {
                var component = job[c - 1];
                total += component["estimatedTime"];
                installedComponentTime.push(total);
            }
            total += job[job.length - 1]["estimatedTime"];
            Jobs.installedTime.push(installedComponentTime);
            Jobs.jobTime[prop] = total;
        }
    },
    getIntalledTime : function (jobID, componentID) {
        if (jobID < Jobs.getJobLength() && componentID < Jobs.getComponentLength()) {
            return Jobs.installedTime[jobID][componentID];
        } else {
            return null;
        }
    },
    getJobTime : function () {
        if (Jobs.currentJobID < Jobs.getJobLength()) {
            return Jobs.jobTime[Jobs.currentJobID];
        } else {
            return null;
        }
    },
    getComponentTime : function () {
        var component = Jobs.getCurrentComponent();
        if (isValid(component)) {
            return component["estimatedTime"];
        } else {
            return null;
        }
    },
    /************************************** download function **************************************/
    // should call setJobs first
    setDownloadSize : function () {
        for (var prop in Jobs.jobs) {
            var total = 0;
            var job = Jobs.jobs[prop];
            var componentTotal = 0;
            var downloadedComponentSize = [];
            for (var c = 0; c < job.length; ++c) {
                var component = job[c];
                var files = component["files"];
                for (var f = 0; f < files.length; ++f) {
                    total += files[f]["size"];
                }
                var fileTotal = componentTotal;
                var downloadedFileSize = [];
                downloadedFileSize.push(fileTotal);
                for (var f = 1; f < files.length; ++f) {
                    fileTotal += files[f - 1]["size"];
                    componentTotal += files[f - 1]["size"];
                    downloadedFileSize.push(fileTotal);
                }
                downloadedComponentSize.push(downloadedFileSize);
                componentTotal += files[files.length - 1]["size"];
            }
            Jobs.downloadedSize.push(downloadedComponentSize);
            Jobs.jobSize[prop] = total;
        }
    },

    getDownloadedSize : function (jobID, componentID, fileID) {
        if (jobID < Jobs.getJobLength() && componentID < Jobs.getComponentLength() && fileID < Jobs.getFileLength()) {
            return Jobs.downloadedSize[jobID][componentID][fileID];
        } else {
            return null;
        }
    },

    // should call setDownloadSize first
    getAllDownloadedSize : function (isCheckInstalled) {
        var size = 0;

        var downloadDir = appExternal.getProperty("downloadPath");
        if (!isValidAndNotEmpty(downloadDir)) { // download directory doesn't exist
            return size;
        }

        for (var prop in Jobs.jobs) {
            var job = Jobs.jobs[prop];
            for (var c = 0; c < job.length; ++c) {
                var component = job[c];
                var files = component["files"];
                if (isCheckInstalled) {
                    var reg = component["registry"];
                    if (Jobs.getDataFromRegistry(reg)) {
                        // installed component, calculate the size of component directly.
                        for (var f = 0; f < files.length; ++f) {
                            size += files[f]["size"];
                        }
                        continue;
                    }
                }
                for (var f = 0; f < files.length; ++f) {
                    var file = files[f];

                    var path;
                    if (downloadDir[downloadDir.length - 1] === '\\' || downloadDir[downloadDir.length - 1] === '/') {
                        path = downloadDir + file["name"];
                    } else {
                        path = downloadDir + "\\" + file["name"];
                    }
                    if (!appExternal.isFileExists(path)) { // File doesn't exist.
                        continue;
                    }

                    // Calculate downloaded size
                    var localFileSize = parseInt(appExternal.getFileSize(path)); // The size of file that has been downloaded
                    var willDownloadSize = file["size"]; // The size of file we want to download.
                    // Choose the smaller one to add
                    if (willDownloadSize > localFileSize) {
                        size += localFileSize;
                    } else {
                        size += willDownloadSize;
                    }
                }
            }
        }

        return size;
    },

    getJobSize : function () {
        if (Jobs.currentJobID < Jobs.getJobLength()) {
            return Jobs.jobSize[Jobs.currentJobID];
        } else {
            return null;
        }
    },

    getTotalJobSize : function () {
        var size = 0;
        for (var i = 0; i < Jobs.getJobLength(); ++i) {
            size += Jobs.jobSize[i];
        }
        return size;
    },

    getFileSize : function () {
        var file = Jobs.getCurrentFile();
        if (isValid(file)) {
            return file["size"];
        } else {
            return null;
        }
    },

    getDataFromRegistry : function (reg) {
        if (isValidAndNotEmpty(reg)) {
            var regKey = reg["key"];
            var regValue = reg["value"];
            var regData = getDataFromReg(regKey, regValue);
            if (isValidAndNotEmpty(regData)) {
                return true;
            }
        }
        return false;
    }
};

/* ======================== multi-language functions ========================*/
/*
 Get OS language
 @return: a language id, use to set lang property.
*/
function getOSLanguage() {
    return appExternal.getOSLang();
}

function getOSLocation() {
    return 0;
}

/*
 Get language by language id
 @param id: it could be 1033, 1041 etc
 @return: a language id, use to set lang property.
*/
function getLanguageByID(id) {
    return appExternal.getLanguageByID(id);
}

function setLanguage(langID) {
    appExternal.setLang(langID);
}

function getLanguage() {
    var lang = appExternal.getProperty("lang");
    var lowLang = lang.toLowerCase();
    if (!isValidAndNotEmpty(lang) || lowLang === "other") {
        lang = "en";
    }

    var langTmp;
    if(lang === "da") {
        langTmp = "dk";
    } else if (lang === "sv") {
        langTmp = "se";
    } else if (lang === "pt") {
        langTmp = "bp";
    }
    var supportedLangs = getSupportedLangs();
    if ($.inArray(lang, supportedLangs) >= 0 || (isValidAndNotEmpty(langTmp) && $.inArray(langTmp, supportedLangs) >= 0)) {
        return lang;
    } else if (supportedLangs[0] === "dk") {
        return "da";
    } else if (supportedLangs[0] === "se") {
        return "sv";
    } else if (supportedLangs[0] === "bp") {
        return "pt";
    } else {
        return supportedLangs[0];
    }
}

/*
 Parse language from string to int
 @param lang: it could be "en", "jp" etc
 @return: a language id
*/
function getParsedInstallLanguage(lang) {
    var langID = appExternal.getParsedInstallLanguage(lang);
    return langID;
}

function setTextToPage() {
    var langText = getLangText();
    $(".lang").each(function(i) {
        var property = $(this).attr("text");
        var propText = langText[property];
        if (!isValid(propText)) {
            propText = "";
        }
        $(this).html(propText);
    });
}

function getLangText () {
    var lang = getLanguage().toLowerCase();
    var langText = stubParams.mui[lang];
    if (!isValidAndNotEmpty(langText)) {
        langText = stubParams.mui["en"];
    }
    return langText;
}

function getMultiText(property) {
    var langText = getLangText();
    var propText = langText[property];
    if (!isValid(propText)) {
        return stubParams.mui["en"][property];
    }
    return propText;
}

// result: Config_ErrorHandle type
// type: "Download" or "Install"
function getErrorText (result, type) {
    var errorText;

    if (result === Config_ErrorHandle.UnknowError) {
        errorText = getMultiText("unknowError");
    } else if (result === Config_ErrorHandle.FileNotExist) {
        errorText = getMultiText("fileNotExist");
    } else if (result === Config_ErrorHandle.DiskFull) {
        errorText = getMultiText("diskFull");
    } else if (result === Config_ErrorHandle.Failure) {
        errorText = getMultiText("failure");
    } else if (result === Config_ErrorHandle.Md5Error) {
        errorText = getMultiText("md5Error");
    } else if (result === Config_ErrorHandle.VolumeReadOnly) {
        errorText = getMultiText("volumeReadOnly");
    } else if (result === Config_ErrorHandle.NoNetwork) {
        errorText = getMultiText("noNetwork");
    } else if (result === Config_ErrorHandle.Cancelled) {
        errorText = getMultiText("cancelled");
    } else if (result === Config_ErrorHandle.Running) {
        errorText = getMultiText("running");
    } else if (result === Config_ErrorHandle.HaveInstalled) {
        errorText = getMultiText("haveInstalled");
    }

    return errorText;
}

/*
    get the stub supported languages
*/
function getSupportedLangs() {
    var supportedLangs = [];
    var configLangs = installParams["LANG"];
    if ( configLangs!==undefined && configLangs.length > 0) {
        supportedLangs = configLangs;  // get from installParams (installparam.js),
    } else {
        // set default language "en" when the stub language is not set
        supportedLangs.push("en");
    }
    return supportedLangs;
}

function initializeDefaultLang() {
    var lang = getOSLanguage();
    if (lang === 0) {
        lang = getParsedInstallLanguage("en");
    }
    setLanguage(lang);
    // current lang maybe not in supported by stub
    var shortLangName = appExternal.getProperty("lang").toLowerCase();
    var shortLangTmp;
    if (shortLangName === "sv"){
        shortLangTmp = "se";
    } else if (shortLangName === "da") {
        shortLangTmp = "dk";
    } else if (shortLangName === "pt") {
        shortLangTmp = "bp";
    }
    var supportedLangs = getSupportedLangs();
    if ($.inArray(shortLangName, supportedLangs) >= 0 || (isValidAndNotEmpty(shortLangTmp) && $.inArray(shortLangTmp, supportedLangs) >= 0)) {
        return;
    } else if (supportedLangs[0] === "dk") {
        supportedLang = "da";
    } else if (supportedLangs[0] === "se") {
        supportedLang = "sv";
    } else if (supportedLangs[0] === "bp") {
        supportedLang = "pt";
    } else {
        supportedLang = supportedLangs[0];
    }
    lang = getParsedInstallLanguage(supportedLang);
    setLanguage(lang);
}

/********************************************** resume ********************************************/
function record () {
    var key = appExternal.getBaseRegKey() + "\\ResumeRecord";
    // write OS to registry
    var os = appExternal.getProperty("isDownload64") == "true" ? "64" : "32";
    appExternal.setDataToReg(key, Config_RegRecorder.OS, os, true);
    // write IsISO
    var iso = appExternal.getProperty("isISO") == "true" ? true : false;
    appExternal.setDataToReg(key, Config_RegRecorder.IsISO, iso ? "true" : "false", true);
    // write language id to registry
    var lang = getLanguage();
    appExternal.setDataToReg(key, Config_RegRecorder.Lang, lang, true);
    // write install directory to registry
    var directory = appExternal.getProperty("downloadPath");
    appExternal.setDataToReg(key, Config_RegRecorder.Directory, directory, true);
    //write IsDownloadOnly
    var isDownloadOnly = appExternal.getProperty("isDownloadOnly");
    appExternal.setDataToReg(key, Config_RegRecorder.IsDownloadOnly, isDownloadOnly, true);
    //write single file info to registry
    var downloadUrl = appExternal.getProperty("downloadUrl");
    if(isValidAndNotEmpty(downloadUrl)){
        appExternal.setDataToReg(key, Config_RegRecorder.DownloadUrl, downloadUrl, true);
    }
    var downloadSize = appExternal.getProperty("downloadSize");
    if(isValidAndNotEmpty(downloadSize)){
        appExternal.setDataToReg(key, Config_RegRecorder.DownloadSize, downloadSize, true);
    }
    // write install components to registry
    var components = "";
    for (var prop in Jobs.jobs) {
        var job = Jobs.jobs[prop];
        for (var c = 0; c < job.length; ++c) {
            var component = job[c];
            var property = component["name"] + os;
            if (appExternal.getProperty(property) == "true") {
                components += property + ";";
            }
        }
    }
    appExternal.setDataToReg(key, Config_RegRecorder.Components, components, true);
}

function resume () {
    var key = appExternal.getBaseRegKey() + "\\ResumeRecord";
    // reset os
    var os = appExternal.getDataFromReg(key, Config_RegRecorder.OS);
    appExternal.setProperty("isDownload64", os == "64" ? "true" : "false");
    // reset IsISO
    var iso = appExternal.getDataFromReg(key, Config_RegRecorder.IsISO);
    appExternal.setProperty("isISO", iso);
    // reset language
    var lang = appExternal.getDataFromReg(key, Config_RegRecorder.Lang);
    setLanguage(getParsedInstallLanguage(lang));
    // reset install directory
    var directory = appExternal.getDataFromReg(key, Config_RegRecorder.Directory);
    appExternal.setProperty("downloadPath", directory);
    //reset isDownloadOnly
    var isDownloadOnly = appExternal.getDataFromReg(key, Config_RegRecorder.IsDownloadOnly);
    appExternal.setProperty("isDownloadOnly", isDownloadOnly);
    //reset single file info
    var downloadUrl = appExternal.getDataFromReg(key, Config_RegRecorder.DownloadUrl);
    if(isValidAndNotEmpty(downloadUrl)){
        appExternal.setProperty("downloadUrl", downloadUrl);
    }
    var downloadSize = appExternal.getDataFromReg(key, Config_RegRecorder.DownloadSize);
    if(isValidAndNotEmpty(downloadSize)){
        appExternal.setProperty("downloadSize", downloadSize);
    }
    // reset install components
    var components = splitStr(appExternal.getDataFromReg(key, Config_RegRecorder.Components), ";");
    for (var i = 0; i < components.length; ++i) {
        if (isValidAndNotEmpty(components[i])) {
            appExternal.setProperty(components[i], "true");
        }
    }
}

function updateComponents (completeComponent) {
    var key = appExternal.getBaseRegKey() + "\\ResumeRecord";
    var components = splitStr(appExternal.getDataFromReg(key, Config_RegRecorder.Components), ";");
    var newComponents = "";
    for (var i = 0; i < components.length; ++i) {
        if (isValidAndNotEmpty(components[i]) && completeComponent != components[i]) {
            newComponents += components[i] + ";";
        }
    }
    appExternal.setDataToReg(key, Config_RegRecorder.Components, newComponents, true);
}

function delRecord () {
    var key = appExternal.getBaseRegKey() + "\\ResumeRecord";
    appExternal.deleteRegKey(key, false);
}

function prepareResume (page) {
    record();
    appExternal.runAfterReboot(page);
}

function undoPrepareResume () {
    appExternal.undoRunAfterReboot();
    delRecord();
}

/********************************************** Post-install actions ********************************************/
function postInstallActions(){
    for (var i = 0; i < Config_PostInstallActions.length; ++i){
        var action = Config_PostInstallActions[i];
        var param ;
        var reg = action["reg"];
        if (isValidAndNotEmpty(reg)) {
            var regKey = reg["key"];
            var regValue = reg["value"];
            param = getDataFromReg(regKey, regValue);
        }

        if(!isValidAndNotEmpty(param)){
            param = action["data"];
        }
        var result;
        if(isValidAndNotEmpty(param)){
            switch(action["type"]){
                case Config_PostInstallActionType.APP:
                    result = appExternal.runApplication(param);
                    break;
                case Config_PostInstallActionType.URL:
                    result = appExternal.openPage(param);
                    break;
                case Config_PostInstallActionType.CMD:
                    result = appExternal.executeCommand(param);
                    break;
            }
        }
    }

}

$(document).ready(function(){
    supportAnyDPI(647, 505);
    setTextToPage();
});

