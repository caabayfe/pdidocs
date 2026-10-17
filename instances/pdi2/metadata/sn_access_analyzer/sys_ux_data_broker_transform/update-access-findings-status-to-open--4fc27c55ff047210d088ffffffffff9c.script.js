function transform(input) {
    var res = "";
	var recId = input.finding_id;
    if (!recId) {
        return res;
    }

    var gr = new GlideRecord('sn_access_analyzer_access_finding');
    if (gr.get(recId)) {
        gr.setValue('status', 'open');
        var isUpdated = gr.update();
        if (isUpdated != null) {
            res = 'success';
        } else {
            res = 'fail';
        }
    }
    return res;
}
