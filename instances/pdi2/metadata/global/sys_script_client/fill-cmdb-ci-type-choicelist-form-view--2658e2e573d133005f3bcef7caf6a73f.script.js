function onLoad() {
    var ga = new GlideAjax('MetricsExplorerUtils');
    ga.addParam('sysparm_name', 'getClassList');
    ga.getXMLAnswer(fillChoiceList);
}

function fillChoiceList(answer) {
    if (answer != null && answer != "") {
		var classes = answer.split(",");
		classes.forEach(className => {
			g_form.addOption('cmdb_ci_type', className, className);
		})
    }
}
