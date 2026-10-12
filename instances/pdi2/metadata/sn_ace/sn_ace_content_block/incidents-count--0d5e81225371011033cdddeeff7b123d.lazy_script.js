(function(context) {
    // Just to make this script take time
    var gr = new GlideRecord("incident");
    gr.query();
    var gr1 = new GlideRecord("sys_script_include");
    gr1.query();
    gr1.getRowCount()
    var sdgr = new GlideRecord("sys_dictionary");
    sdgr.query();
    gs.info(sdgr.getRowCount());

    context.props_details.footer_text = 'Lazily evaluated - inc count (' + gr.getRowCount() + ')';
})(context);
