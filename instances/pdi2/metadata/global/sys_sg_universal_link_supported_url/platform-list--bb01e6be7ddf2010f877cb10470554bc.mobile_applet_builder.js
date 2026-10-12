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

	var regex = /(\w+)_list(\.do)?/;
	var matches = regex.exec(urlPath);
	var tableName = "";
	if (matches !== null && matches.length > 1)
		tableName = matches[1];

	var query = urlQuery.get('sysparm_query');

	mobileScreenBuilder.initListScreen(tableName, query);

	return mobileScreenBuilder;
})(urlPath, urlQuery, originalUrl);
