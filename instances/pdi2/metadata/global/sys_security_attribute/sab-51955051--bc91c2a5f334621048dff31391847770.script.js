answer = (CheckIfUserInList() || gs.hasRole('sn_imt_tracing.admin'));
function CheckIfUserInList() {
    var gr = new GlideRecord("sn_imt_checkin_health_verification_acknowledgement");
    gr.addEncodedQuery('user=' + gs.getUserID());
    gr.setLimit(1);
    gr.query();
    return gr.hasNext();
}
