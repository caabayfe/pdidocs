(function() {
   
    var dictGr = new GlideRecord("sys_dictionary");
    dictGr.addQuery('name', "sys_notification_va_action");
    dictGr.addQuery('element', 'topic');
    dictGr.query();
    if (dictGr.next()) {
        dictGr.setValue('use_reference_qualifier', 'advanced');
        dictGr.setValue('reference_qual', 'javascript:VANotificationActionRefQual.getTopicsForModelType(current)');
        dictGr.update();
        gs.info('VA notification action: Upgraded reference qualifier for topic field');
    }

})();
