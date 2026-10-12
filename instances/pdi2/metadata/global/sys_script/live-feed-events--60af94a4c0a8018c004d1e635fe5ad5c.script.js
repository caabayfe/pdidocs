var gru =  new GlideScriptRecordUtil.get(current)
var fieldsChanged = gru.getChangedFieldNames();
gs.eventQueue('live_feed.update', current, fieldsChanged.toString(), current.sys_mod_count);
