var Password2DataMigrationJobHandler = Class.create();
Password2DataMigrationJobHandler.prototype = {
    LOG_SOURCE : "Trigger Password2 Data Migration Job",
    TRIGGER_NAME : "Password2DataMigrationInitiator",
    MAX_RETRIES : 3,
    SYS_TRIGGER : "sys_trigger",
    retryCount : 0,
    
    initialize: function(retryCount) {
        if(JSUtil.nil(retryCount)) retryCount = 1;
        this.retryCount = retryCount;
        this.name = this.TRIGGER_NAME + "_Retry-" + retryCount;
    },

    process: function() {
        try {
            var resultString = new SNC.KMFGlideEncrypterAPI().runPassword2DataMigration();
            var result = JSON.parse(resultString);

            if (result.Result == "Success") {
                var msg = `Password2 data migration job created successfully. ${resultString}`;
                this._infoLogger(msg);
                return;
            }

            var msg = `Password2 data migration job is not created successfully. ${resultString}`;
            this._errorLogger(msg);
            
            // Retry if KMF is not available at the moment
            if (result.StackTrace != null && result.StackTrace == "KMF_HEALTH_NOT_GREEN") {
                this._createRetryTrigger();
            }
        } catch (e) {
            var msg = `Exception occurred while triggering Password2 data migration job: ${e}`;
            this._errorLogger(msg);
        }
    },

    _createRetryTrigger: function() {
        if(this.retryCount > this.MAX_RETRIES) {
            var msg = `Maximum retry limit reached. Password2 data migration scheduling retried ${this.MAX_RETRIES} times. Reason of Failure: KMF HEALTH NOT GREEN.`;
            this._infoLogger(msg);
            return;
        }
        this._scheduleJob(this.name, this._nextActionDate(this.retryCount));

    },

    /**
     * retry_1 -> 1 hour
     * retry_2 -> 4 hours
     * retry_3 -> 24 hours
     */
    _nextActionDate: function(retryCount) {
        var when = new GlideDateTime();
        var seconds = retryCount * retryCount * 60 * 60;
        if(this.retryCount == 3){
            seconds = 24 * 60 * 60;
        }
        when.addSeconds(seconds);
        return when;
    },

    _scheduleJob: function(name, when) {
        if (this._isTriggerExists(name)) {
            var msg = `Password2 data migration sys_trigger record with name ${name} already exists.`;
            this._infoLogger(msg);
            return;
        }

        var msg = `Retry ${this.retryCount} : Retrying Password2 data migration job creation.`;
        this._infoLogger(msg);
        var trigger = new GlideRecord(this.SYS_TRIGGER);
        trigger.initialize();
        trigger.setValue('state', 0);
        trigger.setValue("trigger_type", 0);
        trigger.setValue('next_action', when);
        trigger.setValue("name", name);
        trigger.setValue('script', "new Password2DataMigrationJobHandler(" + ++this.retryCount + ").process();");
        var sysId = trigger.insert();
        if(sysId) {
            var msg = `Password2 data migration sys_trigger record created with sys_id= ${sysId}`;
            this._infoLogger(msg);
        } else {
            var msg = `Failed to create sys_trigger with name = ${name}`;
            this._errorLogger(msg);
        }
    },

    _infoLogger: function(message) {
        gs.log(`${this.LOG_SOURCE}: ${message}`, this.LOG_SOURCE);
    },

    _errorLogger: function(message) {
        gs.error(`${this.LOG_SOURCE}: ${message}`);
    },

    _isTriggerExists: function(name) {
        var triggerGr = new GlideRecord(this.SYS_TRIGGER);
        triggerGr.addQuery("name", name);
        triggerGr.query();
        return triggerGr.hasNext();
    },

    type: 'Password2DataMigrationJobHandler'
};
