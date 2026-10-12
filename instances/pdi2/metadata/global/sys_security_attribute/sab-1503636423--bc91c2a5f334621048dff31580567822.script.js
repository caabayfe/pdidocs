answer = (CheckIfUserInList() || gs.hasRole('sn_imt_tracing.admin'));
function CheckIfUserInList() {
    var gr = new GlideRecord("sn_imt_tracing_exposure_notice");
    gr.addQuery('user',gs.getUserID());
    gr.setLimit(1);
    gr.query();
    return gr.hasNext();
}
