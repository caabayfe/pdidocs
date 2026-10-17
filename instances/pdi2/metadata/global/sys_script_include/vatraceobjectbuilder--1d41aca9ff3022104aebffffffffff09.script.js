var VATraceObjectBuilder = Class.create();

VATraceObjectBuilder.CONVERSATION_IDENTIFIER = 'conversation';
VATraceObjectBuilder.CALLBACK_IDENTIFIER = 'callback';
VATraceObjectBuilder.TRACE_IDENTIFIER = 'trace';

VATraceObjectBuilder.prototype = {
    initialize: function() {
		this.tracerObject = null;
    },

	withConversationId: function(conversationId) {
		var traceBuilder = new VATraceObjectBuilder();
		traceBuilder.conversationId = conversationId;
		
		return traceBuilder;
	},

	withCallbackId: function(callbackId) {
		var traceBuilder = new VATraceObjectBuilder();
		traceBuilder.callbackId = callbackId;
		
		return traceBuilder;
	},

	withTraceId: function(traceId) {
		var traceBuilder = new VATraceObjectBuilder();
		traceBuilder.traceId = traceId;
		
		return traceBuilder;
	},

	build: function() {
		if (!gs.nil(this.conversationId)) {
			this.tracerObject = new sn_cs_commons.VATracer(VATraceObjectBuilder.CONVERSATION_IDENTIFIER, this.conversationId);
		} else if (!gs.nil(this.callbackId)) {
			this.tracerObject = new sn_cs_commons.VATracer(VATraceObjectBuilder.CALLBACK_IDENTIFIER, this.callbackId);
		} else if (!gs.nil(this.traceId)) {
			this.tracerObject = new sn_cs_commons.VATracer(VATraceObjectBuilder.TRACE_IDENTIFIER, this.traceId);
		} else {
			this.tracerObject = new sn_cs.VATracer();
		}

		return this.tracerObject;
	},

    type: 'VATraceObjectBuilder'
};
