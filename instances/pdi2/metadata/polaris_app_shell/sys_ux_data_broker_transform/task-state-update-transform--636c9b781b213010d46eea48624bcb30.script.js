function transform(input) {
	var sys = input.sysId;
	var state = input.state;
    var gr = new GlideRecordSecure('sysapproval_approver');
    gr.get(sys);
    gr.setValue('state', state);
    gr.update();
}
