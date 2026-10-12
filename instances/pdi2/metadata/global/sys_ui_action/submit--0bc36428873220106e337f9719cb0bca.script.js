var type = current.type;

if (current.type == 'attachment') {
    var agr = new GlideRecord("sys_attachment");
    agr.addQuery('table_name', 'ds_document_version');
    agr.addQuery('table_sys_id', current.sys_id);
    agr.query();
    if (!agr.next()) {
        gs.addErrorMessage(gs.getMessage("No Attachment exists for the version."));
        current.setAbortAction(true);
    } else {
        if (agr.next()) { // More than one attachment
            gs.addErrorMessage(gs.getMessage("Version cannot have more than one attachment."));
            current.setAbortAction(true);
        } else {
            current.url = undefined;
            action.setRedirectURL(current);
            if (current.isNewRecord())
                answer = current.insert();
            else
                current.update();
            gs.include('ActionUtils');
            var au = new ActionUtils();
            au.postInsert(current);
        }
    }
} else {
    var agr = new GlideRecord("sys_attachment");
    agr.addQuery('table_name', 'ds_document_version');
    agr.addQuery('table_sys_id', current.sys_id);
    agr.query();
    if (agr.next()) {
        gs.addErrorMessage(gs.getMessage("No Attachment should be there for URL type"));
        current.setAbortAction(true);
    }
    if (current.isNewRecord())
        answer = current.insert();
    else
        current.update();
    gs.include('ActionUtils');
    var au = new ActionUtils();
    au.postInsert(current);
}
