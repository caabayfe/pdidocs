function transform(input) {
    var id = input && input.access_finding_id;
    if (!id) return {};
    var gr = new GlideRecord("sn_access_analyzer_access_finding");
    if (gr.get(id)) {
        return {
            "finding_details": gr.finding.finding_details.getDisplayValue(),
	    "resolution_details": gr.check.resolution_details.getDisplayValue()
        };
    } else {
        return {};
    }
}
