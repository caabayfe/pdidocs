function transform(input) {
    var res = [];
    if (input.table_name != "") {
        var gr = new GlideRecordSecure(input.table_name);
        gr.addEncodedQuery(input.query);
        gr.query();
        while (gr.next()) {
            var nowGr = new GlideRecordSecure(gr.getValue("target_table_name"));
            res.push({
                "heading": nowGr.getClassDisplayValue(),
                "active": gr.getValue("active"),
                "status": gr.getValue("active")=="1"?gs.getMessage("Active"):gs.getMessage("Inactive"),
                "desc": gr.getDisplayValue("condition"),
                "button_label": gs.getMessage("Edit configuration"),
                "sysId": gr.getValue("sys_id")
            });
        }
    }
    return res;
}
