var tableList = tables.split(",");
for (var i = 0; i < tableList.length; i++) {
   var table = tableList[i];
   var key = "glide.approval_engine." + table;
   var ovalue = gs.getProperty(key) + '';
   var nvalue = request.getParameter("engine_" + table) + '';
   if (nvalue == 'null') // value of null means the control is disabled - don't change it
      nvalue = ovalue;
	
   if (nvalue != ovalue) {
      gs.print("Set approval engine property '" + key + "' to '" + nvalue + "'");
      if (nvalue == "")
         nvalue = "NULL";
         
      var descr = "Approval engine to use for the " + table + " table. " 
                + " Valid options are: 'approval_rules' to use Approval Rules, "
                + "'process_guide' to use Process Guides "
                + "and 'off' to turn off the approval engines for the table (set to 'off' when using Workflow to manage approvals)."
                + " Off is the default setting.";
	   gs.setProperty(key, nvalue, descr);
   }
}
