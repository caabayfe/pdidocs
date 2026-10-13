function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (isLoading)
        return;
    if (newValue == '') {
        g_form.clearOptions('category');
        return;
    }
    g_form.clearOptions('category');
    var ga = new GlideAjax('sn_itom_licensing.ExcludeMetadataAjaxStore');
    ga.addParam('sysparm_name', 'getCategoriesForSKUType');
    ga.addParam('sysparm_skuType', newValue);
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
