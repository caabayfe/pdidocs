function transform(input) {
    var results = [];
	var moreDatesText = gs.getMessage("More Dates");
    if (!input.suite) {
        return results;
    }
    var gr_suite = new GlideRecord('scan_suite_execution');
    gr_suite.orderByDesc('sys_created_on');
    gr_suite.addQuery('suite.sys_id', input.suite);
    gr_suite.query();
    for (var i = 0; i < 9; i++) {
        if (gr_suite.next()) {
            var resultNumber = gr_suite.getDisplayValue("result").toString();
            var res = new GlideRecord('scan_result');
            res.addQuery("number", resultNumber);
            res.query();
            if (res.next()) {
                var resultId = res.sys_id.toString();
                var label = res.sys_created_on.getDisplayValue();
                var displayDate = label.split(" ")[0].toString();
                var gdt = new GlideDateTime(label);
                var created_date = gdt.getDate().toString();
                var time = gdt.getTime();
                var created_time = time.getByFormat('HH:mm:ss').toString();
                results.push({
                    "displayLabel": displayDate,
                    "label": created_date,
                    "id": resultId,
                    "time": created_time,
                    "result": resultNumber
                });
            }
        }
    }

    results.sort(function(a, b) {
        a = a.result.toUpperCase();
        b = b.result.toUpperCase();
        return (a > b) ? -1 : (a < b) ? 1 : 0;
    });

    if (results.length == 9) {
        results.push({
            "displayLabel": moreDatesText,
            "label": moreDatesText,
            "id": "123",
            "time": "",
            "result": ""
        });
    }

    return results;
}
