setDesiredState();

function setDesiredState() {
    var desired = getDesiredState();
    gs.debug("DESIRED = " + desired);
    current.request_state = desired;
}

function getDesiredState() {
    var desired = current.request_state;
    if (desired == 'closed_cancelled') // if we're cancelled we're cancelled
        return desired;

	gs.debug("APPROVAL = " + current.approval + " CHANGES = " + current.approval.changes());
    gs.debug("CURRENT STAGE = " + current.stage);

    if (current.approval.changesTo('approved')) {
        desired = 'in_process';
    } else if (current.approval.changesTo('rejected')) {
        desired = 'closed_rejected';
        current.stage = 'closed_incomplete';
        current.state = 4;
    } else if (current.stage == 'closed_complete') 
         desired = 'closed_complete';
	else if (current.stage == 'closed_skipped')
		desired = 'closed_skipped';
	else if (current.stage == 'closed_incomplete')
		desired = 'closed_incomplete';

    return desired;
}
