function onLoad() {}

function showDialogForRiskyFiles() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('risky_file_update_confirm');
    dlg.setTitle(new GwtMessage().getMessage('File Customizations'));
    dlg.setWidth(575);
    dlg.render();
}
