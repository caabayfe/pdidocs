var SLAAsyncQueue = Class.create();
SLAAsyncQueue.prototype = Object.extendsObject(SLAAsyncQueueSNC, {
    initialize: function() {
		SLAAsyncQueueSNC.prototype.initialize.call(this);
    },

    type: 'SLAAsyncQueue'
});
