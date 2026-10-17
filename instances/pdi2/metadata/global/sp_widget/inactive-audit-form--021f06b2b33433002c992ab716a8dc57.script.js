(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
  data.formWidget = $sp.getWidget('domain-form');	

  // figure out breadcrumbs
  // if Status = Failed & Severity = Error -> Failed Audits
  // if Status = Failed & Severity = Warning -> Warnings
  // if Status = [Queued, Running] -> Active Audits
  // if Active = false -> Inactive Audits
  // otherwise -> loaded directly or after changing filter???
  var sysID = $sp.getParameter('sys_id');
  var gr = new GlideRecord('domain_audit_definition');
  gr.get(sysID);
  if (gr.isValidRecord())
	setBreadcrumbs(gr);
  

  
  function setBreadcrumbs(gr) {
	var breadcrumbs = [];  
	  
	// add "report" breadcrumb (if applicable)
	if (gr.active == false)
		breadcrumbs.push({label: 'Inactive Audits', url: '/domaincenter?id=inactive_audit_list'});

	// add "current" breadcrumb
	var currentLabel = ''+ gr.name;
	var currentURL = '/domaincenter?id=inactive_audits&table=domain_audit_definition&filter=active=false&sys_id=' + gr.sys_id + '&view=sp';
	
	breadcrumbs.push({label: currentLabel, url: currentURL});
	gs.log('inactive-audit-form - adding current breadcrumb for audit: ' + currentLabel);  
	data.breadcrumbs = breadcrumbs;
  }

	
})();
