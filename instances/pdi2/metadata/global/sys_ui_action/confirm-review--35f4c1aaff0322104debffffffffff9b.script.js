var reviewNotes = current.variables.review_notes;
current.setValue('reviewed', true);
if (reviewNotes)
    current.setValue('review_notes', reviewNotes);
current.update();
action.setRedirectURL(current);
gs.addInfoMessage(gs.getMessage('Upgrades to this overridden record have been reviewed.'));
