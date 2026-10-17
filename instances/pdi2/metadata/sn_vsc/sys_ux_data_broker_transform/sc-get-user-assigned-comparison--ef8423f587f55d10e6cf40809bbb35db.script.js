function transform(input) {
    var results = [];

    if (!input.user) {
        return results;
    }

    var resultNumbers = [];
    var comparisonNumbers = "";
    var suiteId = "";
    var gr_comp = new GlideRecord('sn_vsc_scan_comparisons');
    var eQ = "scn_listLIKE" + input.user;
    gr_comp.addEncodedQuery(eQ, true);
    gr_comp.query();
    if (gr_comp.next()) {
        comparisonNumbers = gr_comp.getDisplayValue("scn_comp").toString();
        suiteId = gr_comp.scn_suite.toString();
    } else {
        var comp = new GlideRecord('sn_vsc_scan_comparisons');
        comp.addQuery('scn_default', true);
        comp.query();
        if (comp.next()) {
            comparisonNumbers = comp.getDisplayValue("scn_comp").toString();
            suiteId = comp.scn_suite.toString();
        }
    }
    resultNumbers = comparisonNumbers.split(",");

    var resultIds = [];
    for (var res in resultNumbers) {
        var gr_res = new GlideRecord('scan_result');
        gr_res.addQuery("number", resultNumbers[res]);
        gr_res.query();
        if (gr_res.next()) {
            var sysId = gr_res.sys_id.toString();
            resultIds.push(sysId);
        }
    }

    //Get result id and number for the comparison that user is assigned to
    for (var id in resultIds) {
        var gr_suite = new GlideRecord('scan_suite_execution');
        gr_suite.addQuery('result', resultIds[id]);
        gr_suite.query();
        while (gr_suite.next()) {
            var resultId = resultIds[id];
            var label = gr_suite.sys_created_on.getDisplayValue();
			var systemDate = label.split(" ")[0].toString();
            var gdt = new GlideDateTime(label);
            var created_date = gdt.getDate().toString();
            var time = gdt.getTime();
            var created_time = time.getByFormat('HH:mm:ss').toString();
            var resultNumber = resultNumbers[id];
            results.push({
				"displayLabel": systemDate,
                "label": created_date,
                "id": resultId,
                "time": created_time,
                "result": resultNumber
            });
        }
    }
    results.push({
        "suite": suiteId
    });

    return results;
}
