function callExportUpdateSet() {
   var url = new GlideURL('export_update_set.do');
   url.addParam('sysparm_sys_id', gel("sys_uniqueValue").value);
   url.addParam('sysparm_ck', g_ck);
   url.addParam('sysparm_is_remote', true);

   var frame = top.gsft_main;
   if (!frame)
      frame = top;

   frame.location = url.getURL();
}
