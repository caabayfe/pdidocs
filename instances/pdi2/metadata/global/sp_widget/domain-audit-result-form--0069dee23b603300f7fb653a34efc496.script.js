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
  var gr = new GlideRecord('domain_audit_result');
  gr.get(sysID);
  if (gr.isValidRecord())
	setBreadcrumbs(gr);
  

  
  function setBreadcrumbs(gr) {
	var breadcrumbs = [];  
	  
	// add "report" breadcrumb (if applicable)
	if (gr.status == 'failed')
		if (gr.audit.severity == 'error')
		    breadcrumbs.push({label: 'Failed Audits', url: '/domaincenter?id=failed_audit_list'});
		else
			breadcrumbs.push({label: 'Warning Audits', url: '/domaincenter?id=warning_list'});
	else if (gr.status == 'queued' || gr.status == 'running')
		breadcrumbs.push({label: 'Active Audits', url: '/domaincenter?id=active_audit_list'});
	else if (gr.audit.active == false)
		breadcrumbs.push({label: 'Inactive Audits', url: '/domaincenter?id=inactive_audit_list'});

	// add "current" breadcrumb
	var currentLabel = ''+gr.audit.name;
	var currentURL = '/domaincenter?id=form_and_related_list&table=domain_audit_result&sys_id=' + gr.sys_id + '&view=sp';
	gs.log('domain-audit-result-form - adding current breadcrumb for audit: ' + currentLabel);
	breadcrumbs.push({label: currentLabel, url: currentURL});
	  
	data.breadcrumbs = breadcrumbs;
  }

	
})();
