(function executeRule(current, previous /*null when async*/ ) {
var contentTypeGr = new GlideRecord("sn_ex_sp_favorite_content_type");
contentTypeGr.addQuery("name", current.getValue("name").trim());
contentTypeGr.addActiveQuery();
contentTypeGr.addQuery("sys_id", "!=", current.getValue("sys_id"));
contentTypeGr.query();
if (contentTypeGr.next()) {
  current.setAbortAction(true);
  gs.addErrorMessage(gs.getMessage("Content type with same name already exists"));
}
})(current, previous);
