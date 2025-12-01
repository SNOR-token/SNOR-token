//Disable -- Do not handle restart error code
//Enable -- Restart options when the install error code is system reboot. If the install is not finished, stub should be start automatically when the system is rebooted
var Feature_RestartHandler = true;

//true means billboards is enabled
var Feature_IsBillBoardsEnabled = false;

// billboards image switch interval
var Feature_BillboardSwitchInterval = 2000;

//Disable -- No launch button while installing
//Enable -- Launch button when the main application is installed. Controlled via installerlist.js.
var Feature_LaunchApplicationButton = "Disable";

//Disable – Just a system wait when checking the download files
//Enable – Have progress bar for the checking
var Feature_CheckingProgressBar = false;

//true - Defer the reboot to the end of install
//false - not defer the reboot
var Feature_DeferRebootToEnd = false;