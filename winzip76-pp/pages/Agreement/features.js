// Local –- Load EULA from local html file packaged in the stub. The EULA file should be placed under folder eula\EULA_<LanguageCode>.html
// Internet -- Load EULA from internet
// Custom –- Do not show to EULA window
var Feature_AllowHTMLEULALoading  = "Local";

// EULA link
// the "${lang}" will be replaced by two characters lang string depend on the stub language 
// such as: it,jp, ru,en
var Feature_EulaLink = "http://www.winzip.com/wzgate.cgi?url=www.winzip.com/eula.htm&lang=${lang}&prod=WNZP";

// BULA link
// the "${lang}" will be replaced by two characters lang string depend on the stub language 
// such as: it,jp, ru,en
var Feature_BulaLink = "http://www.winzip.com/wzgate.cgi?url=www.winzip.com/bula.htm&lang=${lang}&prod=WNZP";

// Terms of Use link
// the "${lang}" will be replaced by two characters lang string depend on the stub language 
// such as: it,jp, ru,en
var Feature_TermsOfUseLink = "https://www.winzip.com/wzgate.cgi?lang=${lang}&prod=WNZP&url=www.winzip.com/tou.htm"

// EULA & BULA FAQ link
// the "${lang}" will be replaced by two characters lang string depend on the stub language 
// such as: it,jp, ru,en
var Feature_EulaBulaFaqLink = "http://www.winzip.com/wzgate.cgi?url=www.winzip.com/euba.htm&lang=${lang}&prod=WNZP"

// Enable -- Skip the EULA page if user have already accepted this
// Disable -- Show EULA everytime
var Feature_SkipIfAccepted = "Disable";
