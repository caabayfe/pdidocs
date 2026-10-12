function onLoad() {
    if (g_scratchpad.isSubfilter) {
        return;
    }

    var currValue = g_form.getValue("is_filter_group");
    if (currValue == "true") {
        var ga = new GlideAjax('TodosFilterClientUtil');
        ga.addParam('sysparm_name', 'checkForAssociatedSubFilters');
        ga.addParam('sysparm_filter', g_form.getUniqueValue());
        ga.getXML(function(response) {
            setFieldValue(response, currValue);
        });
    } else {
        var gr = new GlideAjax('TodosFilterClientUtil');
        gr.addParam('sysparm_name', 'checkForAssociatedConditions');
        gr.addParam('sysparm_filter', g_form.getUniqueValue());
        gr.getXML(function(response) {
            setFieldValue(response, currValue);
        });
    }
}

function setFieldValue(response, currValue) {
    var answer = response.responseXML.documentElement.getAttribute("answer");

    if (answer == "true") {
        g_form.setDisabled('is_filter_group', true);
        g_form.hideFieldMsg("is_filter_group");
        if (currValue == "true") {
            g_form.showFieldMsg("is_filter_group", "Associated Subfilters should be deleted for changing isFilterGroup value", "info");
        } else {
            g_form.showFieldMsg("is_filter_group", "Associated Conditions should be deleted for changing isFilterGroup value", "info");
        }

        return;
    } else {

        g_form.setDisabled('is_filter_group', false);

        return;
    }
}
