if (current.request_state == "closed_complete" ||
    current.request_state == "closed_incomplete" ||
    current.request_state == 'closed_cancelled' ||
    current.request_state == 'closed_rejected' ||
    current.stage == "closed_complete" ||
    current.stage == "closed_incomplete" || current.stage == "closed_skipped") {

    current.active = false;

    if (current.closed_by.nil())
        current.closed_by = gs.getUserID();

    if (current.closed_at.nil()) {
        current.closed_at = gs.nowDateTime();
        current.business_duration = gs.calDateDiff(current.opened_at.getDisplayValue(), current.closed_at.getDisplayValue(), false);
        current.calendar_stc = gs.dateDiff(current.opened_at.getDisplayValue(), current.closed_at.getDisplayValue(), true);
    }
    // update the state with request_state or stage.
    if (current.state == 1) {
        var state = current.request_state.indexOf('closed') == 0 ? current.request_state : current.stage;
        switch (state + '') {
            case 'closed_complete':
                current.state = 3;
                break;
            case 'closed_skipped':
                current.state = 7;
                break;
            default:
                current.state = 4;
                break;
        }
    }

}
