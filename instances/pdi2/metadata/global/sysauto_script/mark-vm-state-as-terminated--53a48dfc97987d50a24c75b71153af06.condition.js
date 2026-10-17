
    
    //Trigger new job only when all previously launched jobs are completed.
    var triggerGr = new GlideRecord('sys_trigger');
    triggerGr.addQuery('name', 'ASYNC: Mark VM state as terminated');
    triggerGr.query();
    triggerGr.getRowCount() == 0;
