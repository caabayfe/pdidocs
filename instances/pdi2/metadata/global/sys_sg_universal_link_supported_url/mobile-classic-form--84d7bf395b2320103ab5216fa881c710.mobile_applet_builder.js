/**
* Initialize the mobile screen builder based on the Mobile Screen Type.
*
* List:
* initListScreen(tableName) or
* initListScreen(tableName, listQuery)
*
* Form:
* initRecordScreen(tableName, sysId)
*
* Browser:
* initMobileWebScreen(url)
**/

(function initializeMobileScreenBuilder(/*String*/ urlPath, /*Dictionary*/ urlQuery, /*String*/ originalUrl) {
	var mobileScreenBuilder = new sn_mobile.ScriptableMobileScreenBuilder();

	var tableName = "";
	var sysId = "";

	var pathSegments = urlPath.split("/");
	if (pathSegments.length == 3) {
		tableName = pathSegments[1];
		sysId = pathSegments[2];
	} else if (pathSegments.length >= 4) {
		tableName = pathSegments[2];
		sysId = pathSegments[3];
	}

	mobileScreenBuilder.initRecordScreen(tableName, sysId);

	return mobileScreenBuilder;
})(urlPath, urlQuery, originalUrl);
