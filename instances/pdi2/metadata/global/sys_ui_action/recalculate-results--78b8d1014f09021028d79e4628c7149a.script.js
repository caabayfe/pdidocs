function confirmAndRecalculateAvailability() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    dlg = new dialogClass('availability_recalculate_confirm_form');
    dlg.setTitle(getMessage('Confirmation'));
    dlg.setWidth(450);
    dlg.render();
}
