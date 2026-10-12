(function executeRule(current, previous /*null when async*/ ) {

    var flag = false;
    var gr = new GlideRecord('sn_cmdb_ws_ms_data_mismatch_config');
    gr.query();

    while (gr.next()) {

        // Skip the previous table.
        if (gr.getValue('table') == previous.table)
            continue;

        var au = new global.ArrayUtil();

        // Check if parent class already exists. For example, trying to add server when hardware exists.
        var table = new GlideTableHierarchy(gr.getValue('table'));
        var tables = table.getAllExtensions();
        if (au.indexOf(tables, current.table) >= 0)
            // Check if the attributes and condition_type are equal
            if (areAttributesEqual(gr.getValue('attributes'), current.attributes) && gr.getValue('condition_type') == current.condition_type)
                flag = true;

        // Check if child class already exists. For example, trying to add hardware when server exists.
        table = new GlideTableHierarchy(current.table);
        tables = table.getAllExtensions();
        if (au.indexOf(tables, gr.getValue('table')) >= 0)
            // Check if the attributes and condition_type are equal
            if (areAttributesEqual(gr.getValue('attributes'), current.attributes) && gr.getValue('condition_type') == current.condition_type)
                flag = true;

        if (flag) {
            gs.addErrorMessage(gs.getMessage("'{0}' from the same hierarchy with attributes '{1}' and condition type '{2}' already exists. Cannot add '{3}' within the same hierarchy with same attributes and condition type!", 
				[GlideStringUtil.escapeHTML(gr.getValue('table')), GlideStringUtil.escapeHTML(current.attributes), GlideStringUtil.escapeHTML(current.condition_type), GlideStringUtil.escapeHTML(current.table)]));
            current.setAbortAction(true);
            break;
        }
    }

    function areAttributesEqual(attributes1, attributes2) {
        var arr1 = splitAndTrim(attributes1).sort();
        var arr2 = splitAndTrim(attributes2).sort();
        var au = new global.ArrayUtil();

        return au.diff(arr1, arr2).length == 0;
    }

    function splitAndTrim(attributes) {
        return attributes.split(",").map(function(value) {
            return value.trim();
        });
    }

})(current, previous);
