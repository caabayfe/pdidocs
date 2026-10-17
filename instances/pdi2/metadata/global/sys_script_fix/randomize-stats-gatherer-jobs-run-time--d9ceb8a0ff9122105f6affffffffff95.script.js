
    //Randomizing the run_time of the sys_trigger between 1-12 hours
    var randomNumSecs = Math.floor(Math.random() * (12 * 60 * 60)) + 1;

    updateTriggerRunTime('ef99697453e1111076bcddeeff7b12d7', randomNumSecs, 'Daily');
    updateTriggerRunTime('651dd4375be00210fadffb8f9281c7d9', randomNumSecs + 60, 'Monthly');
    updateTriggerRunTime('828d10775be00210fadffb8f9281c796', randomNumSecs, 'Yearly');

    function updateTriggerRunTime(sysTriggerSysId, updatedtime, type) {
        var sysTriggerGr = new GlideRecord('sys_trigger');
        if(sysTriggerGr.get(sysTriggerSysId)) {
            var currentRunTime = sysTriggerGr.getValue('run_time');
            var currentNextAction = sysTriggerGr.getValue('next_action');
            if (!!currentRunTime) {
                var newRunTime = new GlideDateTime(currentRunTime);
                newRunTime.addSeconds(updatedtime);
                var newNextAction = new GlideDateTime(currentNextAction);
                newNextAction.addSeconds(updatedtime);
                sysTriggerGr.setValue('run_time', newRunTime);
                sysTriggerGr.setValue('next_action', newNextAction);
                sysTriggerGr.update();
                gs.log('Updating the run_time of Physical Table ' + type + ' Stats Gatherer sys_trigger from: ' + currentRunTime + ' to: ' + newRunTime + ' and next_action from: ' + currentNextAction + ' to: ' + newNextAction);
            }
        } else {
            gs.log('Failed to update run_time for stats gatherer job: ' + sysTriggerSysId);
        }
    }
