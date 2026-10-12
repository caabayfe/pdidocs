function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || !newValue) {
        return;
    }

    var checkInFrequency = g_form.getValue("check_in_frequency");
    if (!checkInFrequency || !g_form.getValue("start_date"))
        return;

    var reviewDate = g_form.getValue('review_due_date');
    var goalFrameworkAjax = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
    goalFrameworkAjax.addParam('sysparm_name', 'getReviewDateWhenEndDateChanged');
    goalFrameworkAjax.addParam('sysparm_review_freq', g_form.getValue("check_in_frequency"));
    goalFrameworkAjax.addParam('sysparm_review_date', reviewDate);
    goalFrameworkAjax.addParam('sysparm_start_date', g_form.getValue("start_date"));
    goalFrameworkAjax.addParam('sysparm_end_date', newValue);
	goalFrameworkAjax.addParam('sysparm_old_end_date', oldValue);
    goalFrameworkAjax.addParam('sysparm_sys_id', g_form.getUniqueValue());

    goalFrameworkAjax.getXML(function(response) {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        if (answer && answer['review_due_date']) {
            g_form.setValue('review_due_date', answer['review_due_date']);
        }
    });

}
