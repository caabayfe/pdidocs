// add new search query mode for everyone
var gr = new GlideRecord("sys_properties");
gr.addQuery("name","glide.ais.query.search_operator");
gr.query();
if(gr.next()) {
    gr.setValue("choices","AND then OR 2+ key terms=AND_OR_ENHANCED, AND then OR query=AND_OR, OR query=OR");
    gr.update();
    gs.log('new search query mode added');
}

// if new customer instance, update default value to new search query mode
if (pm.isZboot()) {
    gr.setValue("value","AND_OR_ENHANCED");
    gr.update();
    gs.log('modified default search query mode');
}
