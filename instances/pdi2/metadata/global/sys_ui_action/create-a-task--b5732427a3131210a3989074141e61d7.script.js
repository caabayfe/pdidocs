function showFileATIcket() {
    var numSel = 0;
    var selSysIds = g_list.getChecked();

    if (selSysIds != "") {
        var sysIdList = selSysIds.split(',');
        numSel = sysIdList.length;
    }

    if (numSel < 1) {
        alert(getMessage("Select at least one changed record to file a ticket"));
        return;
    }

    var instanceUrl = this.location.origin + '/';

    var ga = new GlideAjax('ATFTracingHelperAjax');
    ga.addParam('sysparm_name', 'lookupChangeDetails');
    ga.addParam('sysparm_ids', selSysIds);
    ga.getXML(launchModal);

    function launchModal(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		answer = JSON.parse(answer);

        var dialog = new GlideModalForm(getMessage('Create a task'), answer.triageTaskType);
        var q = getMessage("{0}Please investigate the included changed metadata records from test failure{1}See comments for details{2}{3}");
        q = q.withValues(["short_description=", "^description=", "^caller_id=", g_user.userID]);

        var comment = getMessage("The following changes need to be investigated as a test failure regression:") + "\n\n";
        comment += "[code]<ul>";
        for (var i = 0; i < answer.changes.length; i++) {
            var gu = new GlideURL('sys_metadata.do');
            var metadataURL = gu.addParam('sys_id',  answer.changes[i].metadata_id);

            gu = new GlideURL('sys_atf_test_result.do');
            var testResultURL = gu.addParam('sys_id',  answer.changes[i].test_result_id);

            var item = formatMessage(getMessage('<a href="{0}">{1}</a> changed for test result <a href="{2}">{3}</a>'), instanceUrl + metadataURL.getURL(), answer.changes[i].metadata_display_value + '', instanceUrl + testResultURL.getURL(), answer.changes[i].test_result_display_value) + '';
            comment += "<li>" + item + " </li>";
        }

        comment += "</ul>[/code]";

        q += "^comments=" + comment;
        dialog.addParm("sysparm_query", q);
        dialog.setSysID(-1);
        dialog.render();
    }
}
