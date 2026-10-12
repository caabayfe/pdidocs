function transform(input) {
    var obj = new sn_vsc.SCComparisonUtil();
    var poll = new sn_vsc.VscPollForStatus();
    var comparisonType = new sn_vsc.SecurityCenterConstants().hardening_comparison;
    obj.lookForComparison(input.start_date, input.end_date);
    var payload = input.start_date + ',' + input.end_date;
    var status = poll.getProcessStatus(payload, comparisonType);
    if (status == "complete") {
        // Get comparison record
        var grComp = new GlideRecord("sn_vsc_user_comparisons");
        grComp.addQuery('usr_name', payload);
        grComp.query();
        var sysId;
        if (grComp.next()) {
            sysId = grComp.sys_id.toString();
        }
        return sysId;
    }

    return status;
}
