var deleteSize = 1000;
var reportChunks = new GlideRecord('flow_report_chunk');
reportChunks.addEncodedQuery('jc_source_table=sys_flow_report_doc^frd_sys_id=');
reportChunks.setLimit(100000);  // a maximum of 100,000 rows will be deleted per run (~30 seconds in load testing)
reportChunks.query();
var ids = [];
while (reportChunks.next()) {
  ids.push(reportChunks.jc_sys_id.toString());
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
