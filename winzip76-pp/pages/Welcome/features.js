//Enable – Allow user to select installation language, the language string will show in the language of the language, example list: Francais, English, Deutsch, Espanol, ...)
//Disable – Not Allow user to select installation language, but show the select lang
//None --  No language selection box
var Feature_LanguageSelection = "Disable";

//OSLang – OS default language
//OSLocation – OS location setting
//Channel – Channel setting of the stub, in this case,the Channel should be the lang ID
//InstalledLang – The installed application language if the application is already installed
//None – ENU will the the default language.
var Feature_DefaultLanguageOrder = [ "OSLang", "OSLocation", "Channel", "InstalledLang", "None" ];
var Feature_Channel = 1033;

//Enable – There will be a radio button to allow the user to choose install Trial or Full. If the user chooses Full, user is required to input S/N to finish the installation.
//Disable - No Trial/Fulll option
var Feature_AllowTrialFullSelection = "Disable";

//Enable - The S/N input box will be shown with S/N format validation. The product team should implement the S/N validation in the custom stub
//Disable - No S/N validation, and no S/N input box
var Feature_SerialNumberValidation = "Disable";

//SerialNumberFormat - String, the S/N format like xx-xxx-xxxxx. The "-" is the separate of the Serial number input box, the stub framework will generate the inp
//ut boxes based on the format and auto validate the input format. And none case-sensitive, auto formatted to upper case
var Feature_SerialNumberFormat = "xxxxx-xxxxx-xxxxx-xxxxx-xxxxxx";

//Enable -  Remember the S/N the user input last time and show it by default
//Disable - Do not remember the S/N 
var Feature_RememberSerialNumber = false;

//Enable - Valid the Serial Number with a link to check whether it’s valid
//Disable - Do not valid S/N online
var Feature_SerialNumberActivationCheck = false;

//the serial number valaidatiion check Url
var Feature_Serial_number_validation_url = "https://snactivate.pinnaclesys.com/default.aspx";

// Product name, use to check SN online.
// This is the Product ID of the stub usually.
// if empty, it will be set to %ProductID%%MajorVersion%
var Feature_ProductName = "WNZP";
