(function() {
    if (pm.isZboot())
        return;

    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_transform_definition');
    gr.addQuery('element', 'label');
    gr.addOrCondition('element', 'description');
    gr.addQuery('internal_type', 'string');
    gr.query();

    if (gr.next()) {
        new TranslationUtils().convert("sys_transform_definition", ["label", "description"]);
        gs.info('sys_transform_definition.label, sys_transform_definition.description internal type changed from "string" to "translated_text"');
    }

    var grCategory = new GlideRecord('sys_dictionary');
    grCategory.addQuery('name', 'sys_transform_category');
    grCategory.addQuery('element', 'label');
    grCategory.addQuery('internal_type', 'string');
    grCategory.query();

    if (grCategory.next()) {
        new TranslationUtils().convert("sys_transform_category", ["label"]);
        gs.info('sys_transform_category.label internal type changed from "string" to "translated_text"');
    }

}());
