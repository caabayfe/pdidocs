(function(context, pageParams, blockcontext) {
    var gr = new GlideRecord("sys_ux_page_property");
    if (gr.get("e02cea20e0910210f87715d33d78aa64")) {
        var collapseList = gr.getValue("value");
    }

    return {
        collapseList: collapseList,
    };
})(context, pageParams, blockcontext);
