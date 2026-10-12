action.setRedirectURL(current);
var result = current.insert();
if (result) {
    var uri = action.getGlideURI();
    var referringUrl = uri.get("sysparm_referring_url");
    var tableName, tableSysId;

    if (extractTableNameAndSysId()) {
        if (tableName && tableSysId) {
            var gr = new GlideRecord("ds_document_references");
            gr.initialize();
            gr.document = result;
            gr.table_name = tableName;
            gr.target_record = tableSysId;
            gr.insert();
        }
    }
}
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);

var analyticsApi = new global.DocumentAnalyticsAPI();
analyticsApi.sendData('Platform');

function extractTableNameAndSysId() {
    try {
		tableName = uri.get("sysparm_collection");
		tableSysId = uri.get("sysparm_collectionID");
		return true;
    } catch (err) {
        return false;
    }
}
