(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
	
    var options = {
      filter: "active=false",
      table: "domain_audit_definition",
	  fields: "name,category",
      title: "Inactive Audits",
      view: "sp",
	  window_size: "15",
	  color: "default" 
    };
	data.dataTableWidget = $sp.getWidget('data-table-from-instance', options);
})();
