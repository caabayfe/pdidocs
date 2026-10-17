function callExportWorkflowVersion() {
var url = new GlideURL('export_workflow_context.do');
   url.addParam('sysparm_sys_id', gel("sys_uniqueValue").value);
  var frame = top.gsft_main;
   if (!frame)
      frame = top;

   frame.location = url.getURL();
   
}
