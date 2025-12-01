// Simple -- Simple download, no need to config download metadata, but not resumable
// ResumableSimple -- download file with meta data
// note: if the file does not support resume download and this value is ResumableSimple, it will lock the progessbar or return fail.
var Feature_DownloadMode = "ResumableSimple";

// if true, it will append token after url and download in secure mode.
// note: if the file does not support secure download and this value is true, it will lock the progessbar or return fail.
var Feature_IsSecureDownload = false;

// true means before and after download, check file's crc.
var Feature_IsCrcCheck = false;

// true means billboards is enabled
var Feature_IsBillBoardsEnabled = false;

// billboards image switch interval
var Feature_BillboardSwitchInterval = 2000;

//Disable – Just a system wait when checking the download files
//Enable – Have progress bar for the checking
var Feature_CheckingProgressBar = true;

// false - show Destination label; true - hide Destination label
var Feature_IsDestinationHide = true;

// if skip download page, use this to set download_path
// Desktop: set download_path to desktop
// Current: set download_path to current path
// Temp: set download_path to %temp% folder
var Feature_DownloadDirMode = "Temp";