(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
	var detailId = '-1';
	var gr = new GlideRecord('domain_audit_result');
	gr.get($sp.getParameter('sys_id'));
	if (gr.isValidRecord()) {
		gs.log('my-data-table: loaded result record with sys_id: ' + gr.sys_id);
		detailId = gr.detail_id;
	}
	
    var options = {
      filter: "level=1^source=" + detailId,
      table: "syslog_domain",
	  fields: "message",
      title: "Audit Result Details",
      view: "sp",
	  window_size: "15",
	  color: "default" 
    };
	data.dataTableWidget = $sp.getWidget('widget-data-table', options);
})();
