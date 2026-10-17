(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('oauth_entity');
    //sys_id for ServiceNow Classic Mobile App
    gr.get("be57bb02533102006b0fc91a8dc5877c");
    if (current.getValue('value') == 'true')
        gr.setValue('active', 1);
    else
        gr.setValue('active', 0);
    gr.update();
})(current, previous);
