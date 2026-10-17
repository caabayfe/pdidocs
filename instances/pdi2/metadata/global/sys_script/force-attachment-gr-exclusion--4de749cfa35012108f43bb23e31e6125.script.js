(function executeRule(current, previous /*null when async*/ ) {
    var attachmentExclusionForced = false;
    if (current.search_source.datasource.type + '' == 'external') {
        if (current.exclude_in_now_assist_genius_results == false) {
            attachmentExclusionForced = true;
            gs.addInfoMessage(gs.getMessage('Attachments in Now Assist Genius Results is excluded when Search source is from external content'));
        }

    }
    if (current.exclude_in_now_assist_genius_results == true) {
        if (current.exclude_attachments_in_now_assist_genius_results == false) {
            attachmentExclusionForced = true;
            gs.addInfoMessage(gs.getMessage('Attachments in Now Assist Genius Results is excluded when Now Assist Genius Results is excluded.'));
        }
    }

    if (attachmentExclusionForced)
        current.exclude_attachments_in_now_assist_genius_results = true;

})(current, previous);
