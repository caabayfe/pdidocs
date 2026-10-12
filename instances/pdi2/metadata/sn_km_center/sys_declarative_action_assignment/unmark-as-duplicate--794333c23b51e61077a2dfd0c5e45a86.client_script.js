function onClick() {
    var selectedRecords = g_list.getChecked();

	// Reformatting due to parsing issue with the g_list API where getChecked is returning both the display value and
	// the sys_id, rather than just the sys_id
    selectedRecords = selectedRecords.split(',').map(id => {
        const parts = id.split("@");
        return parts.length === 1 ? parts[0] : parts[1]
    }).join();

    var ga = new GlideAjax('sn_km_gen_ai.KMGAFAjax');
    ga.addParam('sysparm_name', 'unmarkDuplicates');
    ga.addParam('sysparm_selectedRecords', selectedRecords);
    ga.getXML(function(response) {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        answer.status == 'success' ? location.reload() : g_form.addErrorMessage(answer.message);
    });
}
