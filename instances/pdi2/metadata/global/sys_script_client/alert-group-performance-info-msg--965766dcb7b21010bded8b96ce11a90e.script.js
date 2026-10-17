function onLoad() {
    var gwt = new GwtMessage();
    var msg = gwt.getMessage("Some filters may slow down impact calculation. To solve this problem, tune your query by adding an appropriate index, as described in Index suggestions for slow queries.");
    g_form.addInfoMessage(msg);

}
