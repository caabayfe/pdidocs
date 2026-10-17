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
	var sysId = urlQuery.get('sys_kb_id');
	mobileScreenBuilder.initMobileWebScreen('mesp?id=me_kb_view&sys_kb_id=' + sysId);
	return mobileScreenBuilder;
})(urlPath, urlQuery, originalUrl);
