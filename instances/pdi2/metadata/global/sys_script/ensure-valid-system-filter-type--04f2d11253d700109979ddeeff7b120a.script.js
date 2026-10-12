(function executeRule(current, previous /*null when async*/ ) {
    if (previous.isValidRecord() && previous.type == current.type && previous.system_address_filter == current.system_address_filter)
        return;

    if (current.type == 'smtp') {
        if (current.system_address_filter && current.system_address_filter.type == 'inbound') {
            gs.addErrorMessage(gs.getMessage('Outbound email account \'{0}\' is misconfigured with an inbound system filter \'{1}\'', [GlideStringUtil.escapeHTML(current.name), GlideStringUtil.escapeHTML(current.system_address_filter.name)]));
            current.setAbortAction(true);
        }
    } else {
        if (current.system_address_filter && current.system_address_filter.type == 'outbound') {
            gs.addErrorMessage(gs.getMessage('Inbound email account \'{0}\' is misconfigured with an outbound system filter \'{1}\'', [GlideStringUtil.escapeHTML(current.name), GlideStringUtil.escapeHTML(current.system_address_filter.name)]));
            current.setAbortAction(true);
        }
    }
})(current, previous);
