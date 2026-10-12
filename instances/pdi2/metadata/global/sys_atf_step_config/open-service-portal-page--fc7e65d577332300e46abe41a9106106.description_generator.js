function generateDescription() {
	var page = '';
	var portal = '';
	var query_params = JSON.parse(step.inputs.query_params || '{}');

	var page_gr = new GlideRecord('sp_page');
	if (page_gr.get(step.inputs.page_id)) {
		page = page_gr.getValue('title');
	}

	var portal_gr = new GlideRecord('sp_portal');
	if (portal_gr.get(step.inputs.portal_id)) {
		portal = portal_gr.getValue('title');
	}

    var qp_str = '';
	for (var p in query_params) {
		if (query_params.hasOwnProperty(p)) {
			qp_str += p + " = " + query_params[p] + "\n";
		}
	}

	if (qp_str === '') {
		return gs.getMessage('Open {0} page in the {1} portal', [page, portal]);
	}

	return gs.getMessage('Open {0} page in the {1} portal with the following query params:\n{2}', [page, portal, qp_str]);
}

generateDescription();
