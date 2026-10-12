var SGTProperties = Class.create();
SGTProperties.prototype = {
    SYS_PROPERTIES: "sys_properties",
    NAME: "name",
    VALUE: "value",

    AUTO_PROVISIONING_PROPERTY: "glide.security.scripting_role.auto_provisioning",
    INITIAL_AUTO_PROVISIONING_JOB_RUNNING_PROPERTY: "glide.security.scripting_role.provisioning_job_running",
    DAILY_AUTO_PROVISIONING_JOB_RUNNING_PROPERTY: "glide.security.scripting_role.update_job_running",

    initialize: function() {},

    isInitialAutoProvisionJobRunning: function() {
        return gs.getProperty(this.INITIAL_AUTO_PROVISIONING_JOB_RUNNING_PROPERTY) === "true";
    },

    isDailyAutoProvisioningJobRunning: function() {
        return gs.getProperty(this.DAILY_AUTO_PROVISIONING_JOB_RUNNING_PROPERTY) === "true";
    },

    updateAutoProvisioningProperty: function(value) {
        var prevValue = gs.getProperty(this.AUTO_PROVISIONING_PROPERTY);
        gs.setProperty(this.AUTO_PROVISIONING_PROPERTY, value);
        return {
            previousValue: prevValue,
            currentValue: gs.getProperty(this.AUTO_PROVISIONING_PROPERTY)
        };
    }
};
