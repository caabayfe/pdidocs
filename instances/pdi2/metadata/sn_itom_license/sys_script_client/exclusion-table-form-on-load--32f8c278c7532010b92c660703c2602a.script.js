function onLoad() {
	var QUERY = 'query';
	var TABLE_NAME = 'table_name';
	var SCRIPT = 'script';
	var CI_IDENTIFIER = "ci_identifier";

	if(g_form.isNewRecord()) {
		g_form.setDisplay('script',false);
		g_form.setDisplay('table_name',false);
		g_form.setDisplay('ci_identifier',false);
		g_form.setDisplay('query',false);
	}
	else if(g_form.getValue('condition_type') == 'script') {

		g_form.setMandatory(TABLE_NAME,false);
		g_form.setMandatory(SCRIPT, true);
		g_form.setMandatory(QUERY,false);
		g_form.setDisplay(QUERY, false);
		g_form.setDisplay(TABLE_NAME, false);
		g_form.setDisplay(SCRIPT, true);
		g_form.setDisplay(CI_IDENTIFIER, false);

	}
	else if(g_form.getValue('condition_type') == 'relationship'){
		g_form.setMandatory(SCRIPT, false);
		g_form.setDisplay(SCRIPT, false);
		g_form.setDisplay(QUERY, true);
		g_form.setMandatory(QUERY,true);
		g_form.setDisplay(TABLE_NAME, true);
		g_form.setDisplay(CI_IDENTIFIER, true);
		g_form.setMandatory(CI_IDENTIFIER,true);
		g_form.setDisabled(TABLE_NAME, true);
	}
	else if(g_form.getValue('condition_type') == 'attribute'){
		g_form.setMandatory(SCRIPT, false);
		g_form.setMandatory(QUERY,true);
		g_form.setDisplay(QUERY, true);
		g_form.setMandatory(TABLE_NAME,true);
		g_form.setDisplay(TABLE_NAME, true);
		g_form.setDisabled(TABLE_NAME, false);
		g_form.setDisplay(SCRIPT, false);
		g_form.setDisplay(CI_IDENTIFIER, false);
	}
	if(g_form.getValue('sku_type') != '')
		updateCategory();
}
function updateCategory() {
    var ga = new GlideAjax('sn_itom_licensing.ExcludeMetadataAjaxStore');
    ga.addParam('sysparm_name', 'getCategoriesForSKUType');
    ga.addParam('sysparm_skuType', g_form.getValue('sku_type'));
    ga.getXML(processResponse);
}

function processResponse(response) {
    var res = response.responseXML.documentElement.getAttribute("answer");
    var categories = JSON.parse(res);
    if (categories.length > 0) {
        g_form.addOption('category', 'All', 'All');
        categories.forEach(function(category) {
            g_form.addOption('category', category, category);
        });
    }
}
