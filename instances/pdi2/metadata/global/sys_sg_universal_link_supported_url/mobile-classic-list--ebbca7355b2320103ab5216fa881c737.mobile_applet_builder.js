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

	var pathSegments = urlPath.split("/");
	if (pathSegments.length == 2)
		tableName = pathSegments[1];
	else if (pathSegments.length >= 3)
		tableName = pathSegments[2];

	var query = urlQuery.get('sysparm_query');

	mobileScreenBuilder.initListScreen(tableName, query);

	return mobileScreenBuilder;
})(urlPath, urlQuery, originalUrl);
