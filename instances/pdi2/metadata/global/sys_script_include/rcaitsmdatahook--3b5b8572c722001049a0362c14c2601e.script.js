var RcaITSMDataHook = Class.create();
RcaITSMDataHook.prototype = {

    initialize: function() {
        this.evtMgmtCommons = new EvtMgmtCommons();
        this.MAX_TASK_SYS_IDS = 1000000;
        this.debugMessage = ''; // For debugging messages in this script, if em debug flag is activated 
    },

    getData: function(sysIDs) {
        var result = {};
        var changesArr = [];

        var cis = sysIDs.split(','); // split of empty string results in an array with empty string of length 1 ['']
        cis = cis.filter(function(ci) {
            return ci.length;
        }); // Filter out empty strings from cis array, e.g. cis = ['', 'my-ci', ''] will become cis = ['my-ci']

        if (cis.length) {
            this.debugMessage += ' *** cis.length: ' + cis.length;
            changesArr = this.getSoftwareData(cis); // Get array of changes for every software that is installed on each ci in cis
            this.evtMgmtCommons.addDebugMessage('RcaITSMDataHook debug: ' + this.debugMessage); // Create one print output for all logs in this script
        }

        result.changesList = changesArr;
        var myJSON = JSON.stringify(result);
        return myJSON;
    },

    getSoftwareData: function(cis) {
        var changesArr = [];

        var gr = new GlideRecord('cmdb_software_instance');
        gr.addQuery('installed_on', cis);
        gr.query();

        this.debugMessage += ' *** cmdb_software_instance gr.getRowCount(): ' + gr.getRowCount();

        var uniqueTaskSysIDs = {};

        while (gr.next() && (Object.keys(uniqueTaskSysIDs).length < this.MAX_TASK_SYS_IDS)) { // Cut off at this.MAX_TASK_SYS_IDS value
            var software = gr.getValue('software');

            if (software) {
                var taskCiGr = new GlideRecord('task_ci');
                taskCiGr.addQuery('ci_item', software);
                taskCiGr.query();
                this.debugMessage += ' *** software task_ci taskCiGr.getRowCount(): ' + taskCiGr.getRowCount();

                while (taskCiGr.next() && (Object.keys(uniqueTaskSysIDs).length < this.MAX_TASK_SYS_IDS)) { // Cut off at this.MAX_TASK_SYS_IDS value
                    var taskSysId = String(taskCiGr.task);
                    if (taskSysId) {
                        uniqueTaskSysIDs[taskSysId] = '';
                    }
                }
            }
        }

        // Transform the task sys ids object to array
        var taskSysIDArr = Object.keys(uniqueTaskSysIDs);

        // Log error when array size is equal or greater than its predefined limit
        if (taskSysIDArr.length >= this.MAX_TASK_SYS_IDS) {
            gs.error('EM - Event Management - Script include RcaITSMDataHook error in function getSoftwareData: taskSysIDArr size is ' + taskSysIDArr.length + ' while its limit is set to ' + this.MAX_TASK_SYS_IDS);
        }

        if (taskSysIDArr.length) {
            var taskGr = new GlideRecord('task');
            taskGr.addQuery('sys_id', taskSysIDArr);
            this.overLoadFilterData(taskGr);
            taskGr.query();
            this.debugMessage += ' *** task taskGr.getRowCount(): ' + taskGr.getRowCount();

            while (taskGr.next()) {

                var ciItem = taskGr.getValue('cmdb_ci');
                var taskSysID = taskGr.getValue('sys_id');
                var className = taskGr.getValue('sys_class_name');
                var description = taskGr.getValue('description');
                var shortDescription = taskGr.getValue('short_description');
                var workStart = taskGr.getValue('work_start');
                var plannedStartTime = taskGr.getValue('start_date');

                var taskDTO = {};
                taskDTO.sys_id = taskSysID;
                taskDTO.task_cmdb_ci = ciItem;
                taskDTO.task_class = className;
                taskDTO.description = description || shortDescription;
                taskDTO.reasoning = "Change on Software";
                taskDTO.root_cause_type = "ChangeRequest";
                taskDTO.score = "1";
                taskDTO.task_time_impl = workStart ? workStart : plannedStartTime;

                changesArr.push(taskDTO);
            }
        }

        return changesArr;
    },

    overLoadFilterData: function(taskGr) {

        var typeDef = ['standard', 'normal', 'emergency'];
        var categoryDef = [];

        /*
         * Please take a look on task.state choice list for those values.
         * They should cover relevant changes only.
         */
        var stateDef = ['-1', '0', '3', '7', '8', '157'];

        var category = gs.getProperty('sa_analytics.rca.filter_category');
        var type = gs.getProperty('sa_analytics.rca.filter_type');
        var state = gs.getProperty('sa_analytics.rca.filter_state');

        var categoryArr = category ? category.split(',') : categoryDef;
        var typeArr = type ? type.split(',') : typeDef;
        var stateArr = state ? state.split(',') : stateDef;

        var timeIntervalInHours = gs.getProperty('sa_analytics.rca.filter_interval_in_hours', '168');

        var timeInterval = new GlideDateTime();
        //second per hour or * millis
        var gt = new GlideTime(timeIntervalInHours * 3600 * 1000);
        timeInterval.subtract(gt);

        taskGr.addQuery('category', categoryArr);
        taskGr.addQuery('type', typeArr);
        taskGr.addQuery('state', stateArr);
        taskGr.addQuery('sys_created_on', '>=', timeInterval);
    },

    type: 'RcaITSMDataHook'
};
