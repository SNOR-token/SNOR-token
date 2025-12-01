
function initEula() {
    var lang = getLanguage().toLowerCase();
    var eulaLink;
    var eulaFullPath;
    if (Feature_AllowHTMLEULALoading === "Local"){
        eulaLink = "eula\\Eula.html";
    } else if (Feature_AllowHTMLEULALoading === "Internet") {
        eulaLink = Feature_EulaLink.replace("${lang}", lang);
    } else if (Feature_AllowHTMLEULALoading === "Custom") {
        $("#agreementContent").hide();
        return;
    }
   
    $("#agreementContent").attr("src", eulaLink);
}

function initLink() {
    var lang = getLanguage().toLowerCase();
    if(lang === "da") {
        lang = "dk";
    } else if (lang === "sv") {
        lang = "se";
    } else if (lang === "pt") {
        lang = "bp";
    }
    // init Eula link
    var eulaLink = Feature_EulaLink.replace("${lang}", lang);
    $("#agreementEulaLink").attr("href", eulaLink);
    // init Bula link
    var bulaLink = Feature_BulaLink.replace("${lang}", lang);
    $("#agreementBulaLink").attr("href", bulaLink);
    // init Tou link
    var touLink = Feature_TermsOfUseLink.replace("${lang}", lang);
    $("#agreementTouLink").attr("href", touLink);
    // init EULA & BULA FAQ link
    var faqLink = Feature_EulaBulaFaqLink.replace("${lang}", lang);
    $("#agreementFaqLink").attr("href", faqLink);
}

function initUserOptionFromCache(){
    var select_agreement = appExternal.getProperty("select_agreement");
    if(isValidAndNotEmpty(select_agreement)){
       $("#agreementCheck").attr("checked", true);
       ButtonConttoller.enableBtn(".nextBtn");
    }
}

function initialize(){
    if(isSilentlyLaunch()){
        Navigator.nextPage();
    }

    if(Feature_SkipIfAccepted === "Enable"){
        var key = appExternal.getBaseRegKey() + "\\ResumeRecord\\" + installParams["PRODUCT_FILE_NAME"];
        var skipAcceptedEula = appExternal.getDataFromReg(key, "skipAcceptedEula");
        if(skipAcceptedEula === "true"){
            Navigator.nextPage();
        }
    }

    setTextToPage();
    initLink();
    //initEula();
    //initUserOptionFromCache();
}

$(document).ready(function () {
    ButtonConttoller.disableBtn(".nextBtn");

    $("#agreementCheck").click(function() {
        if (this.checked) {
            appExternal.setProperty("select_agreement", "true");
            if(Feature_SkipIfAccepted === "Enable"){
                var key = appExternal.getBaseRegKey() + "\\ResumeRecord\\" + installParams["PRODUCT_FILE_NAME"];
                appExternal.setDataToReg(key, "skipAcceptedEula", "true", true); 
            }
            ButtonConttoller.enableBtn(".nextBtn");
        } else {
            ButtonConttoller.disableBtn(".nextBtn");
        }
    });

    $("#next").click(function () {
        trackUserActivity("Agreement_Next");
        trackingByAnalyticsSDK("install.license", "install.license=yes");
        appExternal.setTrackingProperty(Track_Properties.INSTALL_LICENSE, "yes");
        Navigator.nextPage();
    });

    $("#header_close_img").click(function () {
        trackUserActivity("Agreement_Close");
        trackingByAnalyticsSDK("install.license", "install.license=no");
        appExternal.setTrackingProperty(Track_Properties.INSTALL_LICENSE, "no");
        notifyFinalStatus(Config_Status.CANCEL);
        closeApp();
    });

    $("#back").click(function () {
        trackUserActivity("Agreement_Back");
        Navigator.previousPage();
    });

    initialize();
});