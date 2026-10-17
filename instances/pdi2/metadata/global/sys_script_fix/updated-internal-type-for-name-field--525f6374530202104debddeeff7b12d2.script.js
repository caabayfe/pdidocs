gs.info("Started to change the internal type for 'name' column of 'dp_technique_with_params' table");
updateColumnType();

function updateColumnType() {
    if (pm.isZboot())
        return;
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'dp_technique_with_params');
    gr.addQuery('internal_type', 'string');
    gr.addQuery('element', 'name');
    gr.query();
    if (gr.next()) {
        gr.setValue('internal_type', 'translated_field');
        gr.update();
        gs.info("Updated the internal type to 'translated_field' for 'dp_technique_with_params' table field");
    } else {
        gs.info("No 'name' field with type 'string' found in the 'dp_technique_with_params' table");
    }
}
