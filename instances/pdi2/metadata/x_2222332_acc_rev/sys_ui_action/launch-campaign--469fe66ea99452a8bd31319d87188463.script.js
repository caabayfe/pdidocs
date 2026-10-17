// FR-01 to FR-03: validate, then generate in the background.
var due = new GlideDateTime(current.getValue('due_date'));
if (!current.getValue('due_date') || due.compareTo(new GlideDateTime()) <= 0) {
    gs.addErrorMessage(gs.getMessage('Set a due date in the future before launching.'));
} else if (!current.getValue('fulfilment_group')) {
    gs.addErrorMessage(gs.getMessage('Set the fulfilment group before launching.'));
} else {
    current.setValue('state', '10');
    current.update();
    gs.eventQueue('x_2222332_acc_rev.campaign.launched', current, '', '');
    gs.addInfoMessage(gs.getMessage('Generating review items. The campaign opens for review when they are ready.'));
}
action.setRedirectURL(current);
