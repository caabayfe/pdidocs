(function executeRule(current, previous /*null when async*/ ) {

    var inputValue = current.value;
    //If value is empty or if it doesn't contain 'debug' or '*' 
    if (GlideStringUtil.nil(inputValue) || !(inputValue.includes("debug") || inputValue.includes("*"))) {
        return;
    }
    var defaultLogLevel = 'error,info,warn';
    //Not resetting the default of syslog for identification engine as the default is error,debug,debugVerbose
    // sys_log has different default value for CMDBHealth
    if (current.name == 'glide.cmdb.logger.use_syslog.CMDBHealth') {
        defaultLogLevel = 'error';
    }
    var script = "if (gs.getProperty('" + current.name + "') != null) { gs.setProperty('" + current.name + "', '" + defaultLogLevel + "');}";
    var scheduleName = 'Resetting CMDB Log to default';

    var msgArray = [];
    msgArray.push(current.name);
    msgArray.push(defaultLogLevel);

    var when = new GlideDateTime();
    when.addDays(2);

    var maxBehindTime = new GlideDateTime();
    maxBehindTime.addDays(-2);
    var gr = new GlideRecord('sys_trigger');
    //next_action is an indexed column will improve this query performance
    gr.addQuery('next_action', '<=', when);
    gr.addQuery('next_action', '>=', maxBehindTime);
    //ASYNC is added during scheduling
    gr.addQuery('name', 'ASYNC: ' + scheduleName);
    gr.addQuery('script', 'CONTAINS', current.name);
    gr.query();
    if (gr.hasNext()) {
        gr.next();
        msgArray.push(gr.getValue('next_action'));
        gs.info('Already scheduled job exists to reset log for ' + current.name);
        gs.addInfoMessage(gs.getMessage("Already scheduled job exists to reset '{0}' to default value '{1}' at {2}", msgArray));
    } else {
        //Schedule a job to reset the logs to default values after 2 days
        gs.info('Scheduling a job to reset to default log for ' + current.name);
        GlideRunScriptJob.scheduleScript(script, scheduleName, when);
        gs.addInfoMessage(gs.getMessage("Scheduling a job to reset '{0}' to default value '{1}' after 2 days if not deleted", msgArray));
    }

})(current, previous);
