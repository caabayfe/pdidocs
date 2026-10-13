function onBefore(current, previous) {
   //This function will be automatically called when this rule is processed.
   
   // if this basic rule and there is another basic rule with same source IP, port and order, do not allow 
   // to save
   if (current.rule_type == "Basic") {
	   var gr = new GlideRecord("cmdb_ci_translation_rule");
	   gr.addQuery("rule_type", "Basic");
	   gr.addQuery("source_ip", current.source_ip);
	   gr.addQuery("source_port", current.source_port);
 	   gr.addQuery("order",current.order);
	   gr.addQuery("sys_id", "!=", current.sys_id);
	   gr.query();
	   if (gr.next()) {
		   	gs.addErrorMessage(gs.getMessage("There is another basic rule having the same source IP, source port and order"));
	        current.setAbortAction(true);
	   }
   }
}
