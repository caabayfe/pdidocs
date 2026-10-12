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
	if (urlPath !== undefined) {
		var splitPath = urlPath.split(".");
		tableName = splitPath[0];
	}

    var sysId = urlQuery.get('sys_id');

    mobileScreenBuilder.initRecordScreen(tableName, sysId);

	return mobileScreenBuilder;
})(urlPath, urlQuery, originalUrl);
