function createOrOpenSurveyResults() {
    var dlg = typeof GlideModal != 'undefined' ? new GlideModal('email_loader') : new GlideDialogWindow('email_loader');
    dlg.setTitle(new GwtMessage().getMessage('View Responses in Rows'));
    dlg.setWidth(450);
    dlg.render();
    var metricId = g_form.getUniqueValue();
    var ga = new GlideAjax('SurveyReportingScript');
    ga.addParam('sysparm_name', 'generateResultsView');
    ga.addParam('sysparm_metric_id', metricId);
    ga.getXML(function(response) {
		dlg.destroy();
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer)
			window.location.href = '/u_metric_' + metricId + '_result_list.do';
        else
			g_form.addErrorMessage(getMessage('Something went wrong in creating the table.'));
    });
}
