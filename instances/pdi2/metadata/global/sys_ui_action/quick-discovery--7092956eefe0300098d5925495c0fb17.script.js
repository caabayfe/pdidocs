function quickDiscovery() {
    var gdw = new GlideDialogWindow("quick_discovery");
    var gwt = new GwtMessage();
    gdw.setTitle(gwt.getMessage('Quick Discovery'));
    gdw.setSize(350, 300);
    gdw.render();
}
