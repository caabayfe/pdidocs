var DeploymentFlowUtils = Class.create();
DeploymentFlowUtils.prototype = {
	/*
     * Initialization: 
	 * Sets up pipelineEnvironmentOrderList based on the passed pipelineSysId
     * Sets up processedEnv based on the passed processed or initializes it to an empty array
	 * Identifies the list of unprocessed records
	 *
     * @param {String} pipelineSysId - sys_id of the pipeline
     * @param {String} processed - optional list of pipelineEnvironmentOrder object with the following keys : pipelineEnvironmentOrderSysId, environmentSysId, order, environmentName, instanceUrl
     */
    initialize: function(pipelineSysId, processed) {
        this.pipelineSysId = pipelineSysId;
        this.processedEnv = processed || [];
        this.pipelineEnvironmentOrderList = new sn_pipeline.PipelineEnvironmentOrderUtils().getPipelineEnvironmentOrderList(pipelineSysId);

        var maxProcessedOrder;
        var processedMap = {};

        this.processedEnv.forEach(function(pipelineEnvOrder) {
            processedMap[pipelineEnvOrder.pipelineEnvironmentOrderSysId] = pipelineEnvOrder;
			var currentOrder = parseInt(pipelineEnvOrder.order);
			
			if(typeof maxProcessedOrder === 'undefined') {
				maxProcessedOrder = currentOrder;
			} else {
				maxProcessedOrder = currentOrder > maxProcessedOrder ? currentOrder : maxProcessedOrder;
			}
        });

        var processedSysIds = Object.keys(processedMap);

        this.unProcessedEnv = this.pipelineEnvironmentOrderList.filter(function(data) {
            var recordOrder = parseInt(data.order);

            var isPreviouslyProcessed = processedSysIds.indexOf(data.sys_id) >= 0;
            var isOrderSameOrGreaterThanLastProcessedOrder = recordOrder >= maxProcessedOrder;
			
			/*
			 	When a pipeline environment order record is previously processed, the record should be considered as unprocessed if:
				1. The record's order has been modified since last processing and the modified order is greater than or the same as the order the last time it was processed.
				
				When a pipeline environment order record is not previously processed, the record should be considered as unprocessed if any of the following scenarios evaluate to true:
				1. The record's order is greater or the same as the max processed order.
				2. nothing has been processed till now.
			*/
            if (isPreviouslyProcessed) {
                var isOrderSameAsPreviousProcessing = data.order === processedMap[data.sys_id].order;

                return !isOrderSameAsPreviousProcessing && isOrderSameOrGreaterThanLastProcessedOrder;
            } else {
                return typeof maxProcessedOrder === 'undefined' || isOrderSameOrGreaterThanLastProcessedOrder;
            }
        });
	},

    getNextPipelineEnvironmentOrderRecordInfo: function() {
        var currentEnv = this.unProcessedEnv.shift();

        if (currentEnv) {
            var transformedObject = {
                pipelineEnvironmentOrderSysId: currentEnv.sys_id,
                environmentSysId: currentEnv.environment.sys_id,
                order: currentEnv.order,
                environmentName: currentEnv.environment.name,
                instanceUrl: currentEnv.environment.instance_url,
				instanceType: currentEnv.environment.instance_type,
            };

            this.processedEnv.push(transformedObject);

            return transformedObject;
        }

        return null;

    },

    getPipelineEnvironmentOrderList: function() {
        return this.pipelineEnvironmentOrderList;
    },

    getProcessedPipelineEnvironmentOrderList: function() {
        return this.processedEnv;
    },

    getUnProcessedPipelineEnvironmentOrderList: function() {
        return this.unProcessedEnv;
    },

    type: 'DeploymentFlowUtils'
};
