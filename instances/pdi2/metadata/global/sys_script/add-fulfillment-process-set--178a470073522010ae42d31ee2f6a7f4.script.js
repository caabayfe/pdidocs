(function executeRule(current, previous /*null when async*/ ) {

    var targetTable = current.getValue('table_name');
    if (targetTable) {
        var targetGR = new GlideRecord(targetTable);
        if (targetGR.isValid() && targetGR.instanceOf('sc_service_fulfillment_step')) {
            var ioSetGR = new GlideRecord('io_set_item');
            ioSetGR.addQuery('sc_cat_item', current.getUniqueValue());
            ioSetGR.addQuery('variable_set', '73c0764073122010ae42d31ee2f6a77a');
            ioSetGR.query();
            if (ioSetGR.next())
                return;

            ioSetGR.setValue('sc_cat_item', current.getUniqueValue());
            ioSetGR.setValue('variable_set', '73c0764073122010ae42d31ee2f6a77a');
            ioSetGR.setValue('order', 9999);
            ioSetGR.insert();

        }

    }

})(current, previous);
