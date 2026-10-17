var deleteSize = 1000;
var contextChunks = new GlideRecord('flow_context_chunk');
contextChunks.addEncodedQuery('jc_source_table=sys_flow_context^fc_sys_id=');
contextChunks.setLimit(100000);  // a maximum of 100,000 rows will be deleted per run (~30 seconds in load testing)
contextChunks.query();
var ids = [];
while (contextChunks.next()) {
  ids.push(contextChunks.jc_sys_id.toString());
  if (ids.length >= deleteSize) {
    deleteChunks(ids);
    ids = [];
  }
}
if (ids.length > 0) {
 deleteChunks(ids);
}

function deleteChunks(ids) {
  var chunks = new GlideRecord('sys_json_chunk');
  chunks.addQuery('sys_id', 'IN', ids.join(','));
  chunks.query();
  chunks.deleteMultiple();
}
