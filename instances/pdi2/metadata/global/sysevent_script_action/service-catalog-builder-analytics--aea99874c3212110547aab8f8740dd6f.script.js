var ACTION_TYPE = "action_type";
var CAT_ITEM = "cat_item";
var DOCUMENT_ID = "document_id";

var params = null;
try {
      params = JSON.parse(event.parm1);
} catch (e) {
      gs.log('Error while parsing parm1 for catalog_builder_analytics: ' + e);
}

var analyticsRecord = new GlideRecord("catalog_builder_analytics");
analyticsRecord.setValue(ACTION_TYPE, params[ACTION_TYPE] || '');
analyticsRecord.setValue(CAT_ITEM, params[CAT_ITEM] || '');
analyticsRecord.setValue(DOCUMENT_ID, params[DOCUMENT_ID] || '');
analyticsRecord.insert();
