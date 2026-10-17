function onCondition() {
    var gwt = new GwtMessage();
    var msg = gwt.getMessage("Daily snapshots follow a single time zone. For broader time zone support, choose All activity");
    g_form.showFieldMsg('frequency', msg);
}
