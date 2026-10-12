var g_hierarchy_erd;
var params;

addRenderEvent(GHchartOnload);
addUnloadEvent(GHchartUnload);

function getTableName (table, language) {
        var gr = new GlideRecord("sys_documentation");
        gr.addQuery('name', table);
        gr.addQuery('element', null);
        gr.addQuery('language', language);
        gr.query();
        var tableName;
        if(gr.next() && gr.label != null && typeof gr.label != "undefined" && gr.label != "")
            tableName = gr.label;
        if (!tableName)
            if (language != "en")
                tableName = getTableName(table, "en");
            else
                tableName = table;
        return tableName;
}

function processCheckBox(params, att){
        var tempParams = params.clone();
        if (params.values[att] == "true"){
            gel(att).checked = true;
            tempParams.values[att] = "false";
        }else
            tempParams.values[att] = "true";
        var ref_url = tempParams.createURL();
        $(gel(att)).on("click", function(){ self.location.href=ref_url });
}

function processCheckBoxes(params){
        processCheckBox(params, "show_referenced");
        processCheckBox(params, "show_referenced_by");
        processCheckBox(params, "show_extended");
        processCheckBox(params, "show_extended_by");
}

function createBreadcrumb(params){
        var table_history_split = htmlEscape(params.clone().pushTable("").values["table_history"]).split('|');
        var breadcrumb = "";
        for (var i=0; i < table_history_split.length; i++){
            var tempParams = params.clone().clearTableExpansion();
            tempParams.values["table_history"] = "";
            tempParams.values["table"] = "";
            for (var j=0; j <= i; j++)
                tempParams.pushTable(table_history_split[j]);
            var onclick = 'self.location.href="'+stripSpecialChars(tempParams.createURL())+'";';
            var divider = "";
            if (i < table_history_split.length -1)
                divider = "&"+"gt;";
            var tableName = getTableName(tempParams.values["table"], user_language);
			tableName = sanitizeHtml(tableName);
            breadcrumb += "<span onclick='"+onclick+"' class='breadcrumb-link'>"+tableName+"</span>"+
                          "<span> "+divider+" </span>";
        }
        gel('breadcrumb_area').innerHTML = breadcrumb;
}

function stripSpecialChars(str) {
    if (str === null || str === undefined)
        return '';
    return String(str).replace(/[^A-Za-z0-9_ ]/g, '');
}

function changeItem(passedValue, language){
        if (passedValue != null) {
            var gr = new GlideRecord("sys_documentation");
            gr.addQuery('sys_id', passedValue);
            gr.addQuery('element', null);
            gr.addQuery('language', language);
            gr.query();
            if (gr.next())
                document.location.href = params.clone().pushTable(gr.name).clearTableExpansion().createURL();
        }
}

function GHchartOnload(){
        var atts_split = generic_hierarchy_erd_attributes.split(',');
        params = new ParametersERD(atts_split);
        processCheckBoxes(params);
        createBreadcrumb(params);
        if (params.values["table"] && params.values["table"].length > 0){
            g_hierarchy_erd = new GenericHierarchyERD('diagram_area', 'ERDProcessor', params, ["expanded_key_color", "expanded_key_text"]);
            g_hierarchy_erd.load(atts_split);
        }
}

function GHchartUnload(){
        if (g_hierarchy_erd)
            g_hierarchy_erd.destroy();
}
