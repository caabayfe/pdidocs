var FlowExecutionSummaryUtil = Class.create();
FlowExecutionSummaryUtil.prototype = {

    initialize: function() {
		
    },
	getFlowExecutionReport: function(contextId) {
		return new sn_flow.OperationsReport().getFlowExecutionReport(contextId);
	},
	getFlowReport: function( contextId) {
		return new sn_flow.OperationsReport().getFlowReport(contextId);
	},

	getFlowErrorReport: function (contextId) {
		return new sn_flow.OperationsReport().getFlowErrorReport(contextId);
	},

	getFlowContext: function (contextId) {
		return new sn_flow.OperationsReport().getFlowContextReport(contextId);
	},

	getStepReports: function(contextId, actionReportId) {
		return new sn_flow.OperationsReport().getStepReports(contextId, actionReportId);
	},

    type: 'FlowExecutionSummaryUtil'
};
