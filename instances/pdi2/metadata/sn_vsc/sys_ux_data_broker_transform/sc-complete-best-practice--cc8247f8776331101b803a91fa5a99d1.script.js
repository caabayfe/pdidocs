function transfor(input) {
    var res = "";
    var gr = new GlideRecord('sn_vsc_best_practice_configurations');
    var recId = input.bp_id;
    if (gr.get(recId)) {
        gr.setValue('status', 'completed');
        var isUpdated = gr.update();
        if (isUpdated != null) {
            res = 'success';
        } else {
            res = 'fail';
        }
    }
    return res;
}
