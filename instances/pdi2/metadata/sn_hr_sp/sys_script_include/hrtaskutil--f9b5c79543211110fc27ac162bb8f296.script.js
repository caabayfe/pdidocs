var HRTaskUtil = Class.create();
HRTaskUtil.prototype = {
    initialize: function() {},
    getTaskFulfillmentTypeJourneyOrLE: function(taskId) {
        var taskGr = new GlideRecord("sn_hr_core_task");
        if (taskGr.get(taskId)) {
            if ((taskGr.parent && taskGr.parent.hr_service) &&
                (taskGr.parent.hr_service.fulfillment_type == "journey" ||
                    taskGr.parent.hr_service.fulfillment_type == "lifecycle_event"))
                return taskGr.parent.hr_service.fulfillment_type.toString();
            if ((taskGr.parent.parent && taskGr.parent.parent.hr_service) &&
                (taskGr.parent.parent.hr_service.fulfillment_type == "journey" ||
                    taskGr.parent.parent.hr_service.fulfillment_type == "lifecycle_event"))
                return taskGr.parent.parent.hr_service.fulfillment_type.toString();
            if ((taskGr.parent.parent.parent && taskGr.parent.parent.parent.hr_service) &&
                (taskGr.parent.parent.parent.hr_service.fulfillment_type == "journey" ||
                    taskGr.parent.parent.parent.hr_service.fulfillment_type == "lifecycle_event"))
                return taskGr.parent.parent.parent.hr_service.fulfillment_type.toString();
        }
        return '';
    },
    type: 'HRTaskUtil'
};
