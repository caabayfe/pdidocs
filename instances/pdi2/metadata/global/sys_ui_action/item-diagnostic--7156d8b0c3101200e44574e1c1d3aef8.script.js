var d = new CatalogItemDiagnosticScore('sc_cat_item', 'b177b092c3330200e44574e1c1d3ae4d');
var sys_id = d.processItem(current);

var gr = new GlideRecord('diagnostics_result');

if (gr.get(sys_id) && gr.score > 0)
	action.setRedirectURL('/diagnostics_result.do?sys_id=' + sys_id);

else {
	gs.addInfoMessage(gs.getMessage("The analysis of this item returned no Conflicting Variables, AJAX call or DOM Manipulation in Client Scripts."));
	action.setRedirectURL(current);
}
