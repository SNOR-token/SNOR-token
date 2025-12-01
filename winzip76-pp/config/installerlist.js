
var Components = [
	{
        // group id, the same group of components download and install in one progress bar
		"group" : 0,
		"sku" : "Pro", // it's a value of Config_SourceIDMapping
		"type" : ComponentType.Prerequiste | ComponentType.Selectable, // details see config.js
        // DotNet is a key of languages of Config_StubMultiLangs in lang.js
		"name" : "DotNet",
        // component's installation time (second), it will be diaplayed on the progress bar if stub shows installing page while installing
		"estimatedTime" : 5,
		"files" : [
			{ 
				"name" : "prerequiste/NDP46-KB3045560-Web.exe", // downloaded filename
				"url" : "https://download.microsoft.com/download/1/4/A/14A6C422-0D3C-4811-A31F-5EF91A83C368/NDP46-KB3045560-Web.exe", // .Net 4.6 for support vista
                // install parameter, if defined this object, means the file is a installer file;
                // if 'param' contains '${XXX}', it will be replaced with property 'XXX' before install,
                // property 'XXX' should be set using appExternal.setProperty in setParameterProperty function in page.js of installing by user
				"param" : " /q /norestart /qn",
                // file size, it can be calculated automatically if the value is 0
				"size" : 1497400,
                // installed size, the value gets from user
				"installSize": 1497400, 
                // crc of file, empty means it will not do crc check even if the stub requires crc check
				"crc" : ""
			}
		]
	},

	{
		"group" : 1,
		"sku" : "Pro",
		"type" : ComponentType.X64 | ComponentType.X86,
		"name" : "MainContent",
        // registry of installer file
		"registry" : {
            // registry key of install path
			"key" : "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\winzip.exe",
            // registry value of install path, to check whether the component is installed
			"value" : ""
		},
        // If this property is defined and not empty, means this component is the Main Application component.
		// You can launch the program after installed it.
		"program" : "WinZip${osbits}.EXE",
		"estimatedTime" : 10,
		"files" : [
			{ 
				"name" : "winzip_${lang}_${osbits}.msi",
				"url" : "https://download.winzip.com/nkln/24/winzip_${lang}_${osbits}.msi", 
				"param" : "INSTALLFAH=1 /qn",
				"size" : 0,
				"installSize": 0,
				"crc" : ""
			}
		]
	}
];
