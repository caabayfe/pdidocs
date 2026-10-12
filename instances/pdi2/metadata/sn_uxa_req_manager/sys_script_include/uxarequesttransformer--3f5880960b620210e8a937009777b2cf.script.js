var UxaRequestTransformer = Class.create();

UxaRequestTransformer.prototype = {
    initialize: function({requestData, requestType}) {
		this.requestType = requestType;

		this.metricParMapping = {
			simple: 'count',
			group: 'group',
			trend: 'trend',
			['group-by-props']: 'event-props'
		};
    },

	transform: function(requestData) {
		if (this.requestType === 'par') {
			return this.transformParRequest(requestData);
		}
		else if (this.requestType === 'nextgen') {
			return this.transformNextgenRequest(requestData);
		}
	},

	transformGenericRequest: function(request, requestType) {
		const { 
			dataCategory,
			type,
			metric,
			metricDivision,
			startTime,
			endTime,
			apiKey,
			params
		} = request;
    
		return {
			type,
			table: type,
			metric: requestType === 'par' ? this.metricParMapping[dataCategory] : metric,
			startTime,
			endTime,
			apiKey,
			params
		};
	},


	transformParRequest: function(requestData) {
		return this.transformGenericRequest(requestData, 'par');
	},

	transformNextgenRequest: function(requestData) {
		return this.transformGenericRequest(requestData, 'next-gen');
	},
    type: 'UxaRequestTransformer'
};
