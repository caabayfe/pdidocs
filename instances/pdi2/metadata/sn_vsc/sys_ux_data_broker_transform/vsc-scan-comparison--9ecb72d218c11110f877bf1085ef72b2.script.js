function transform(input) {
    if (!input) {
        return '';
    }
    if (!input.date1.contains(null) && !input.date2.contains(null)) {
        //Get scan comparison results
        var sysId = "";
        var obj = new sn_vsc.ScanComparisonUtil();
        var poll = new sn_vsc.VscPollForStatus();
        var firstResult = obj.checkTableForResult(input.date1);
        var secondResult = obj.checkTableForResult(input.date2);
        obj.lookForComparison(firstResult, secondResult);
        var grR1 = new GlideRecord('scan_result');
        grR1.get(firstResult);
        var result1 = grR1.number;
        var gr2 = new GlideRecord('scan_result');
        gr2.get(secondResult);
        var result2 = gr2.number;
        var payload = result1 + ',' + result2;
        var comparisonType = new sn_vsc.SecurityCenterConstants().scan_comparison;
        var status = poll.getProcessStatus(payload, comparisonType);
        if (status == "complete") {
            // Get comparison record
            var grComp = new GlideRecord("sn_vsc_scan_comparisons");
            grComp.addQuery('scn_comp', payload);
            grComp.query();
            if (grComp.next()) {
                sysId = grComp.sys_id.toString();
            }
            return sysId;
        }

        return status;
    }
}
