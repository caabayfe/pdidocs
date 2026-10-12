if (import_set_table_list == '') {
  gs.addInfoMessage("Please select an import set table first");
} else {
  var t_array = import_set_table_list.split(',');
  for(i = 0; i < t_array.length; i++) {
    var cleaner = new ImportSetCleaner(t_array[i]);
    // prevent deletion of system tables and system maps
    if (t_array[i].indexOf("imp_") == 0) {
      cleaner.setDataOnly(true);
      cleaner.setDeleteMaps(false);
    } else {
      cleaner.setDataOnly(data_only == 'true');
      cleaner.setDeleteMaps(maps == 'true');
    }
    
    cleaner.clean();
  }
  response.sendRedirect("import_log_list.do?sysparm_query=ORDERBYDESCsys_created_on^source=Cleanup^sys_created_on>javascript:gs.daysAgo(1)");
  gs.addInfoMessage("Cleanup completed<script>refreshNav();</script>");
  	
}
