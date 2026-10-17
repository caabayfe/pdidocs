var SLAAsyncQueueHealthCheck = Class.create();
SLAAsyncQueueHealthCheck.prototype = Object.extendsObject(SLAAsyncQueueHealthCheckSNC, {
    initialize: function() {
		SLAAsyncQueueHealthCheckSNC.prototype.initialize.call(this);
    },

    type: 'SLAAsyncQueueHealthCheck'
});
