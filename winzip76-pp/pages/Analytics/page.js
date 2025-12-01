function initLink() {
    var lang = getLanguage().toLowerCase();
    if(lang === "da") {
        lang = "dk";
    } else if (lang === "sv") {
        lang = "se";
    } else if (lang === "pt") {
        lang = "bp";
    }
    // init Privacy link
    var privacyLink = Feature_PrivacyPolicyLink.replace("${lang}", lang);
    $("#analyticsPrivacyLink").attr("href", privacyLink);
}

function initialize(){
    if(isSilentlyLaunch()){
        Navigator.nextPage();
    }

    setTextToPage();
    initLink();
}

$(document).ready(function () {
    $("#disagree").click(function() {
        trackUserActivity("Analytics_Disagree");
        trackingByAnalyticsSDK("install.analytics", "install.analytics=opt-out");
        appExternal.setTrackingProperty(Track_Properties.INSTALL_ANALYTICS, "opt-out");
        var baseKey = appExternal.getBaseRegKey();
        var key = baseKey.substring(0, baseKey.lastIndexOf("stubframework")) + "WINZIP\\SUBS";
        appExternal.setDataToReg(key, "GDPR_OPTIN", "0", true); 
        Navigator.nextPage();
    });

    $("#agree").click(function () {
        trackUserActivity("Analytics_Agree");
        trackingByAnalyticsSDK("install.analytics", "install.analytics=opt-in");
        appExternal.setTrackingProperty(Track_Properties.INSTALL_ANALYTICS, "opt-in");
        var baseKey = appExternal.getBaseRegKey(); 
        var key = baseKey.substring(0, baseKey.lastIndexOf("stubframework")) + "WINZIP\\SUBS";
        appExternal.setDataToReg(key, "GDPR_OPTIN", "1", true); 
        Navigator.nextPage();
    });

    $("#header_close_img").click(function () {
        trackUserActivity("Analytics_Close");
        notifyFinalStatus(Config_Status.CANCEL);
        closeApp();
    });

    $("#back").click(function () {
        trackUserActivity("Analytics_Back");
        Navigator.previousPage();
    });

    initialize();
});