var tableName = "em_alert_rule";
var gra = new GlideAggregate(tableName);
if (gra.isValid()) {
   gra.setWorkflow(false);
   gra.addQuery("enable_remediation" , "1"); 
   gra.addQuery("active" , "1");
   // Get only automatic remediation records
   gra.addQuery("execution" , "1");
   // Ignore Demo data rules
   gra.addQuery("workflow", "!=",  "b4e8682037033100ddf3cc028e41f108");
   gra.addQuery("sys_id", "!=",  "6c66cee837433100ddf3cc028e41f1ba");
 
   gra.addAggregate('COUNT');
               
   var rowCount = 0;
   gra.query();
  
   if (gra.next()) {
      rowCount = gra.getAggregate('COUNT');
      if(rowCount > 0) {
	      gs.setProperty("evt_mgmt.max_objs_in_alert_query", "1");
	      gs.log('Number of records in "' + tableName + '" is: ' + rowCount + " setting evt_mgmt.max_objs_in_alert_query property to 1");
      }
   }
}
