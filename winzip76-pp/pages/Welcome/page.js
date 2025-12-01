function getLicense() {
    var license = "";
    $("input.license_part").each(function() {
        license += $(this).val() + "-";
    });
    return license.substring(0, license.length - 1);
}

function inputLicenseCheck(tar) {
    var content = tar.val(), formatArray, index, currentLength, next, className;
    if (isEmpty(content)) { 
        return; 
    }

    formatArray = Feature_SerialNumberFormat.split("-");
    className = $.trim(tar.prop("class").replace("license_part", ""));
    index = parseInt(className.substring(4));
    currentLength = formatArray[index].length;
    if(content.length > currentLength - 1){
        content = content.toUpperCase();
        tar.val(content.substring(0, currentLength));
        index++;
        next = tar.siblings(".part" + index);
        if(!isEmpty(next)){
            if (isEmpty(content.replace("-", "").substring(currentLength)))
            { 
                return; 
            }
            next.focus(); // need to activate the next input text before get substring
            // activate the input text again after obtaining the substring
            next.val(content.replace("-", "").substring(currentLength)).focus();
            inputLicenseCheck(next);
        }
    }
}

function inputLicenseIntoPart(text) {
    text = $.trim(text.replace(new RegExp('-', "g"), "").replace(new RegExp(' ', "g"), "")).toUpperCase();
    var formatArray = Feature_SerialNumberFormat.split("-");
    var start=0, stop=0;
    $(".license_part").each(function(index, value){
        stop = start + formatArray[index].length;
        $(value).val(text.substring(start, stop));
        start = stop;
    });
}


function renderLicenseInputArea(){
    if(Feature_SerialNumberFormat == null){
        return;
    }
    var formatArray = Feature_SerialNumberFormat.split("-");
    var inputAreaHtml = "<input type='text' class='license_part part0'>";
    var inputAreaCount = formatArray.length;
    for(var i=1; i<inputAreaCount; i++){
        inputAreaHtml = inputAreaHtml + "-<input type='text' class='license_part part" + i + "'>";
    }
    $("#license_text").html(inputAreaHtml);

}

function getSNValiationErrorCode(errorMessage) {
    if(errorMessage === "ERROR_SERIAL_NUMBER_USED_TOO_MANY_TIMES") {
        return 1001;
    } else if(errorMessage === "ERROR_SERIAL_NUMBER_IS_INVALID" ) {
        return 1002;
    } else if(errorMessage === "ERROR_SERIAL_NUMBER_NOT_FOUND") {
        return 1003;
    } else{
        return 1004;
    }  
}

function setDefaultLang (index) {
	if (index >= Feature_DefaultLanguageOrder.length) {
		return;
	}

	var lang = 0;
    switch (Feature_DefaultLanguageOrder[index]) {
    	case "OSLang":
    		lang = getOSLanguage();
    		break;
    	case "OSLocation":
            lang = getOSLocation();
    		break;
    	case "Channel":
    		lang = getLanguageByID(Feature_Channel);
    		break;
    	case "InstalledLang":
            lang = getLanguage();
    		break;
        default:
            lang = getParsedInstallLanguage("en");
            break;
    }
    if (lang != 0) { // find the language id
    	setLanguage(lang);
    	return;
    }
    setDefaultLang(++index);
}

function setSelectLanguage() {
    var languagediv = $(".select_language");
    if(Feature_LanguageSelection === "Disable")
    {
        languagediv.prop("disabled", "true");
    } else if (Feature_LanguageSelection === "None") {
    	languagediv.hide();
        $(".select_language_text").hide();
        return;
    }

    var localLanguage = getLanguage();
    var obj = getRegions();
    var selectLang = localLanguage;
    var isLocalLangInConfigList = false;
    var supportedLangs = getSupportedLangs();

    for(var i=0; i<supportedLangs.length; i++) { 
        var lang = supportedLangs[i];
        if(isValidAndNotEmpty(obj[lang])) {
            if(lang === localLanguage) {
                isLocalLangInConfigList = true;
            }
            languagediv.append($("<option></option>").attr("value", lang).text(obj[lang]));
        }
    }  

    if(!isLocalLangInConfigList) { // set the first valid lang as selected lang
        for(var j=0; j<supportedLangs.length; j++) {
            var lang = supportedLangs[j]; 
            if(isValidAndNotEmpty(obj[lang])) {
                selectLang = lang;
                break;
            }
        }
        setLanguage(getParsedInstallLanguage(selectLang));
    }

    $(".select_language").val(selectLang);   
}

function getRegions() {
    return Config_StubMultiLangs["regions"];
}

function initUserOptionFromCache(){
    var select_lang = appExternal.getProperty("selected_lang");
    if(isValidAndNotEmpty(select_lang)){
        $(".select_language").val(select_lang);
        setLanguage(getParsedInstallLanguage(select_lang));
    }

    var select_type = appExternal.getProperty("select_type");
    if(isValidAndNotEmpty(select_type)){
        $("input[name='install_type'][value='" + select_type + "']").attr("checked", true);
    }  
}

function initialize(){

    setDefaultLang(0);
    //setSelectLanguage();

    initUserOptionFromCache();

    setTextToPage();

    // set tracking properties and track install start
    appExternal.setTrackingProperty(Track_Properties.STUB_LANGUAGE, getLanguage().toLowerCase());
    appExternal.setTrackingProperty(Track_Properties.STUB_CHANNEL, installParams["CHNL"]);
    var downloadUrl = replaceParams(installParams["DOWNLOAD_URL"]);
    appExternal.setTrackingProperty(Track_Properties.MSI_FILE_NAME, getFilename(downloadUrl));
    trackingByAnalyticsSDK("install.start", "");

    if(Feature_AllowTrialFullSelection != "Enable"){
        $(".trial_select").hide();
        // hide all the radio buttons if disable trial and full selection
        $('input:radio[name="install_type"]').hide();
    }

    if(Feature_SerialNumberValidation === "Enable"){
        renderLicenseInputArea();

        var serialNumber = appExternal.getSavedSerialNumber();
        if(appExternal.localValidateSerial(serialNumber)){
            $(".license_part:first").val(serialNumber);
            inputLicenseCheck($(".license_part:first"));
        }

    } else {
        $(".trial_select").hide();
        $(".full_select").hide();
        $("#license_text").hide();
        Feature_SerialNumberActivationCheck = false;
    }

    if(isSilentlyLaunch()){
        Navigator.nextPage();
    }
}

$(document).ready(function(){

    initialize();

    $("input.license_part").on("keyup", function() {
        $("#fb_message").hide();
        var text = $(this).val().toUpperCase();
        $(this).val(text);
        inputLicenseCheck($(this));
    });

    $("input.license_part").bind('paste', function(e) {
        $("#fb_message").hide();
        var text = "";
        if (window.clipboardData && window.clipboardData.getData) { // IE
            text = window.clipboardData.getData('Text');
        } else  if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) { // other browsers
            text = e.originalEvent.clipboardData.getData('text/plain');
        }
        inputLicenseIntoPart(text);
        return false;
    });

    $(".select_language").bind('change', function(e){
    	var lang = $(this).val();
        appExternal.setProperty("selected_lang", lang); // cache for back
        setLanguage(getParsedInstallLanguage(lang));
        setTextToPage();
    });

    $("#next").click(function () {
        trackUserActivity("Welcome_Next");
        
        var selectValue = $('input:radio[name="install_type"]:checked').val();
        if (isValidAndNotEmpty(selectValue)) {
            appExternal.setProperty("select_type", selectValue);//cache the select value
        }
        
        if( selectValue === "trial"){   
            Navigator.nextPage();
            return;
        } 

        var serialNumber = getLicense();
        if(!Feature_SerialNumberActivationCheck){
            if(Feature_RememberSerialNumber){
                appExternal.saveSerialNumber(serialNumber);
            }
            Navigator.nextPage();
            return;
        } 
        if(appExternal.localValidateSerial(serialNumber)){
            try{
                var snValidateResult = appExternal.onlineValidateSerial(Feature_Serial_number_validation_url, serialNumber, Feature_ProductName);
                snValidateResult = $.parseJSON(snValidateResult);
                if(snValidateResult.Status === "success"){
                    if(Feature_RememberSerialNumber){
                        appExternal.saveSerialNumber(serialNumber);
                    }
                    Navigator.nextPage();
                } else {
                    if(snValidateResult.errorMessage === "ERROR_SERIAL_NUMBER_USED_TOO_MANY_TIMES") {
                        $("#fb_message").html(getMultiText("SNTooManyTimes") + getMultiText("SNErrorCode").replace("%error%", getSNValiationErrorCode(snValidateResult.errorMessage)));
                    } else {
                        $("#fb_message").html(getMultiText("SNServerInvalid") + getMultiText("SNErrorCode").replace("%error%", getSNValiationErrorCode(snValidateResult.errorMessage)));
                    }
                    $("#fb_message").show();
                }
            } catch(e) {
                $("#fb_message").html(e);
                $("#fb_message").show();
            }        
        } else {
            $("#fb_message").html(getMultiText("SNLocalInvalid"));
            $("#fb_message").show();
        }
    });

    $("#header_close_img").click(function () {
        trackUserActivity("Welcome_Close");
        notifyFinalStatus(Config_Status.CANCEL);
        closeApp();
    });
    
});