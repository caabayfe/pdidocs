var SchedulerScriptFactory = Class.create();
SchedulerScriptFactory.prototype = {
	
        getSchedulerScript: function() {
            if (GlideProperties.getBoolean("com.snc.cluster.vncc.enabled"))
                return new SchedulerVNCC();
            else
                return new Scheduler();
    },

    type: 'SchedulerScriptFactory'
};
