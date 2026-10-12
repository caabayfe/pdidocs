(function() {
    var stdChgRecDictionary = new GlideRecord('sys_dictionary');
    stdChgRecDictionary.addQuery('name', 'std_change_record_producer');
    stdChgRecDictionary.addQuery('element', 'current_version');
    stdChgRecDictionary.query();
    if (stdChgRecDictionary.next()) {
        var gAttr = new GlideAttributes(stdChgRecDictionary.getValue('attributes'));
        gAttr.setAttribute('readonly_clickthrough', 'true');
        stdChgRecDictionary.setValue('attributes', gAttr.serializeAttributes());
        stdChgRecDictionary.update();
    }
})();
