function sections() {
   var widgetTypes = {};
   widgetTypes["Top Searches"] = topSearchSections();
   // add any other types of text search widgets here
   return widgetTypes;
}

function topSearchSections() {
    var widgetTypes = {};
    var widgetName = "Top Searches - All";
    widgetTypes[widgetName] = generateTopSearchSectionObject(widgetName, "top", "");
    var propertyName = "glide.ts.widget.top_search_tables";
    var tablesProperty = gs.getProperty(propertyName);
    if (tablesProperty != "") {
       var tables = tablesProperty.split(",");
       for (var i=0; i < tables.length; i++) {
          var tableName = tables[i];
          var gr = new GlideRecord(tableName);
          if (!gr.isValid()) {
             gs.log("Text Search table \"" + tableName + "\" specified by " + propertyName + " is not a valid table; skipping");
             continue;
          }
      
          widgetName = "Top Searches - " + gr.getLabel();
          widgetTypes[widgetName] = generateTopSearchSectionObject(widgetName, "top", tableName);
       }
    }
    return widgetTypes;
}

function generateTopSearchSectionObject(widgetName, widgetType, tableName) {
   return { "type" : widgetType, "table" : tableName };
}

function render() {
	var type = renderer.getPreferences().get("type");
        var tableName = renderer.getPreferences().get("table");
        var gf = new GlideForm(renderer.getGC(), "render_gadget_text_searches_" + type, 0);
        gf.setDirect(true);
        gf.setRenderProperties(renderer.getRenderProperties());
        return gf.getRenderedPage();
}

function getEditLink() {
   return ""; // no edit
}
