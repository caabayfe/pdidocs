var CommunicationPlanMutexWrapper = Class.create();
CommunicationPlanMutexWrapper.prototype = {
    initialize: function(taskId) {
		this.mutexName = 'TCM' + taskId;
		this.mutexMetricName = 'Communication plan mutex';
		this.mutex = new SelfCleaningMutex(this.mutexName, this.mutexMetricName);
    },

	getLock: function() {
		this.mutex.setSpinWait(500);
		this.mutex.setMaxSpins(240);
		this.mutex.setMutexExpires(120000); //120 seconds
		return this.mutex.get();
	},

	releaseLock: function() {
		this.mutex.release();
	},

    type: 'CommunicationPlanMutexWrapper'
};
