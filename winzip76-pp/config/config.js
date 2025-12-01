// page selector
// Note: Initialization page is must have page.
var Config_SequencePages = ["Initialization", "Welcome", "Agreement", "Analytics", /*"Prerequisite",*/ "Downloading", "Finish"];

// if true, installParams["DOWNLOAD_URL"] in installparams.js is installerlist.js link,
// otherwise, installParams["DOWNLOAD_URL"] is a package link.
var Config_MultiDownload = false;

//Disable – No OS Architecture options
//Force – Force 32 bit OS install 32 bit version, 64 bit OS install 64 bit version
//UserOption – 32 bit install 32 bit version. on 64 bit, the default option is 64 bit, but user can choose 32 bit.
var Config_OSArchitectureSelection = "Force";

// reports fatal errors and upon failure if true, else continue with process.
var Config_Essential = true;

//if true will check the stub version and  update to newest version
//else not
var Config_SupportSelfUpdate = false;

//Disable -- No patch option
//ForceHidden -- Force install the latest patch, and user will not see the patch
//ForceShow -- Force install the latest patch, and user will see the patch in the list
//UserOption -- Show patch info, and user can choose to install or not install the patch
var Config_PatchOption = "Disable";

// true - extract .zip file in the download
// false - extraft .zip file in the install
var Config_ExtractInDownload = false;

//true - check the prerequiste components, if all the components installed not show the Prerequisite page.
//false - not check the prerequiste components, the Prerequisite page will always dispaly if configed
var Config_CheckPrerequiste = false;

// workflow
var Config_Steps = {
    NotStart: 0,
    Download: 1,
    Extract: 2,
    Install: 3,
    Current: 0
};
// Download and install error handle, the same as StubFramework.h
var Config_ErrorHandle = {
    NoError : 0,
    UnknowError : 1,
    FileNotExist : 2,
    DiskFull : 3,
    Failure : 4,
    Abort : 5,
    Md5Error : 6,
    VolumeReadOnly : 7,
    NoNetwork : 8,
    Cancelled : 9,
    Running : 10,
    Reboot : 11,
    HaveInstalled: 12,
    OtherInstalling: 13
};
// resume mode, the same as StubFramework.h
var Config_ResumeMode = {
    NONE : 0,
    DOWNLOADING : 1,
    INSTALLING : 2
};
// a mapping for source id and sku
var Config_SourceIDMapping = {
	"123456" : "Pro",
	"123789" : "Std"
};
// record information in registry, use for downloading and installing process
var Config_RegRecorder = {
	"OS" : "_OS_",
	"IsISO" : "_IsISO_",
	"Lang" : "_Lang_",
	"Directory" : "_Directory_",
	"Components" : "_Components_",
	"IsDownloadOnly" : "_IsDownloadOnly_",
	"DownloadUrl" : "_DownloadUrl_", //just for single file download
	"DownloadSize" : "_DownloadSize_" //just for single file download
};
// progress value, use for downloading and installing process
var Config_ProgressItem = {
    LastProcess : 0,
    CurrentProcess : 0,
    TotalProcess : 1
};

// component type use for download and install
var ComponentType = {
	Inherit: 0,				// normal component, no special attributes
	X86: 1,					// 32-bit component
	X64: 2,					// 64-bit component
	Selectable: 4,			// component that can be selected to download and install
	MustSelect: 8,			// component that must be selected to download and install
	Patch: 16,				// patch component
	Prerequiste: 32 		// Prerequisite component, such as DotNet4.0, DirectX9.0 etc
};

//Post-install actions
//After product installation is complete, the stub installer can perform one last configurable action upon exit.
var Config_PostInstallActionType = {
	APP: 0,
	URL: 1,
	CMD: 2
};

var Config_PostInstallActions = [
	{
		"type": Config_PostInstallActionType.APP,
		"reg": {
			"key": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Corel\\Setup\\StubFrameWork",
			"value":"RunAPP"
		},
		"data": ""

	},
	{
		"type": Config_PostInstallActionType.URL,
		"reg": {
			"key": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Corel\\Setup\\StubFrameWork",
			"value":"OpenURL"
		},
		"data": ""
	},
	{
		"type": Config_PostInstallActionType.CMD,
		"reg": {
			"key": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Corel\\Setup\\StubFrameWork",
			"value":"ExecuteCMD"
		},
		"data": ""
	}
];

//configuration for single file download
var Config_SingleDownload = {
	//the name of the startprogram file
	"program" : "WinZip.EXE",
	//the estimated time(second) of installation
	"estimatedTime" : 30,
	"registry": {
		// registry key of install path
		"key" : "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\winzip.exe",
		// registry value of install path, to check whether the component is installed
		"value" : ""
	}
};

// for the single file download,The Config_PrerequisteComponents should be configured as follow
var Config_PrerequisteComponents = [
	{
		"group" : 0,
		"sku" : "Pro",
		"type" : ComponentType.Prerequiste,
		"name" : "DotNet",
		// registry of installer file
		"registry" : {
            // registry key of install path
			"key" : "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full",
            // registry value of install path, to check whether the component is installed
			"value" : "Release"
		},
		"estimatedTime" : 5,
		"files" : [
			{ 
				"name" : "prerequiste/NDP46-KB3045560-Web.exe", 
				"url" : "https://download.microsoft.com/download/1/4/A/14A6C422-0D3C-4811-A31F-5EF91A83C368/NDP46-KB3045560-Web.exe",
				"param" : " /q /norestart /qn", // file contains param that could be installed
				"size" : 1497400,
				"installSize": 1497400, 
				"crc" : "0"
			}
		]
	}
];

// For install reporting
var Config_Status = {
    NOTSTART : 0,
    COMPLETED : 1,
    ERROR : 2,
    CANCEL : 3,
    ENVIRONMENT_NOT_MEET : 4,
    DOWNLOADED : 5,
    STUB_FAILED : 6
};

// For tracking properties
var Track_Properties = {
    STUB_CHANNEL : 0,
    STUB_LANGUAGE : 1,
    MSI_FILE_NAME : 2,
    INSTALL_ANALYTICS : 3,
    INSTALL_LICENSE : 4
};