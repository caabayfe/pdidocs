knowledgeView();
function knowledgeView() {
  var kv = new GlideRecord("kb_use");
  kv.initialize();
  kv.used = true;
  kv.user.setValue(event.parm2);
  kv.article = event.instance;
  var params = JSON.parse(event.parm1);
  kv.session_id = params.glideSessionId;
  if(params.hasOwnProperty("ts_query_id")){
	  kv.search_id = params.ts_query_id;
  }
  if(params.hasOwnProperty("domainId")){
	  kv.sys_domain = params.domainId;
  }
  kv.insert();
  new global.KBCommon().incrementUseCount(event.instance);
}
