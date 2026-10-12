// copy the graph
var gr = new GlideRecord("jrobin_graph");
gr.initialize();
gr.title = gs.getMessage("Copy of ") + current.title;
gr.jrobin_definition = current.jrobin_definition;
gr.vertical_label = current.vertical_label;
gr.duration.setDateNumericValue(current.duration.dateNumericValue());
var graphID = gr.insert();

// copy the archives
var grFrom = new GlideRecord("jrobin_graph_line");
var grTo = new GlideRecord("jrobin_graph_line");
grFrom.addQuery('jrobin_graph', current.sys_id);
grFrom.query();
while (grFrom.next()) {
   grTo.initialize();
   grTo.jrobin_graph = graphID;
   grTo.jrobin_definition = grFrom.jrobin_definition;
   grTo.jrobin_datasource = grFrom.jrobin_datasource;
   grTo.aggregator = grFrom.aggregator;
   grTo.area = grFrom.area;
   grTo.color_picker = grFrom.color_picker;
   grTo.color = grFrom.color;
   grTo.order = grFrom.order;
   grTo.insert();
}

// redirect to the copy we just created
gs.setRedirect(current.getTableName() + ".do?sys_id=" + graphID);
