var GenAILargeInputHandler = Class.create();
GenAILargeInputHandler.prototype = {
    initialize: function() {
		this.logger = new sn_log.GlideLogger("com.glide.one_extend.GenAILargeInputHandler");
	},

	_postProcess: function (attributes, capabilityId, definitionId) {
		// Get extension instance for large input handler
		var largeInputHandler = this._getLargeInputHandler(capabilityId, definitionId, "global.GenAILargeInputPostprocessor");
		var combineRequestAttributes = largeInputHandler.process(attributes, capabilityId);
		return combineRequestAttributes;
	},

	_mergeObjects: function (primary, secondary) {
		for (var skey in secondary) {
			primary[skey] = secondary[skey];
		}
		return primary;
	},

	_sortResultsBySequenceNumber: function (response) {
		var results = Object.keys(response.result).map(function (key) {
			return response.result[key];
		});
		results.sort(function (result1, result2) {
			return result1.meta.sequenceNumber - result2.meta.sequenceNumber;
		});

		return results;
	},

	_groupByCapabilities: function (results, retainChunks) {
		var capabilityGrouped = {};
		var retainChunkAdded = {};
		results.forEach(function (result) {
			var capability = result.meta.originalPayload["_meta"].capability;
			if (!capabilityGrouped[capability]) {
				capabilityGrouped[capability] = [];
			}
			if (!retainChunkAdded[capability]) {
				capabilityGrouped[capability] = capabilityGrouped[capability].concat(retainChunks[capability] || []);
				retainChunkAdded[capability] = true;
			}
			capabilityGrouped[capability].push(result);
		});

		return capabilityGrouped;
	},

	_prepareExecutionRequest: function (capability, results, originalExecutionRequest) {
		// Get essential parameters for combine request
		var nonChunkedAttrPayload = null;
		var chunkedAttributeResponses = {};
		var parentFilter = null;
		var definitionId = "";
		for (var i = 0; i < results.length; i++) {
			var attrName = "";
			if ((!results[i].result || !results[i].result.response) && results[i].chunk) {
				attrName = results[i].chunkedAttributeName;
				if (chunkedAttributeResponses[attrName]) {
					chunkedAttributeResponses[attrName].unshift(results[i].chunk);
				} else {
					chunkedAttributeResponses[attrName] = [results[i].chunk];
				}
				continue;
			}
			// Get the input attributes without large input
			if (!nonChunkedAttrPayload) {
				nonChunkedAttrPayload = results[i].meta.originalPayload;
			}

			// Get all the config filters for the combine request
			var originalFilters = results[i].meta.originalPayload["_meta"].configFilters || {};
			if (!parentFilter) {
				parentFilter = this._mergeObjects(originalFilters, results[i].meta.parentFilter);
			}
			
			// Get definition ID
			if (!definitionId) {
				definitionId = results[i].meta.originalPayload["_meta"].definition;
			}

			// Add chunk results to an array for further processing on the extension point
			attrName = results[i].meta.chunkedAttributeName;
			if (chunkedAttributeResponses[attrName]) {
				chunkedAttributeResponses[attrName].push(results[i].result.response);
			} else {
				chunkedAttributeResponses[attrName] = [results[i].result.response];
			}
		}

		// Invoke extension point for getting combine attributes
		var payload = this._mergeObjects(nonChunkedAttrPayload, chunkedAttributeResponses);
		payload = this._postProcess(payload, capability, definitionId);
		delete payload["_meta"];

		var executionRequest = {};
		if (originalExecutionRequest) {
			executionRequest = originalExecutionRequest;
		}
		if (!executionRequest.meta) {
			executionRequest.meta = {};
		}
		executionRequest.payload = payload;
		executionRequest.meta.configFilters = parentFilter;
		executionRequest.meta.enableRecursiveExecution = false;
		// Pin the reduce step to on-Glide. The chunks executed on-Glide; the combine step
		// must run there too so the routing decision matches what produced the inputs.
		// canExecuteWithMosaic gate #8 (offglide_execution meta) honors this.
		executionRequest.meta.offglide_execution = false;

		return executionRequest;
	},

	processCompleted: function(response) {
		try {
			// Get results sorted by sequence number
			var results = this._sortResultsBySequenceNumber(response);
			var retainChunks = response.meta.retainChunks || {};

			var capabilitiesGrouped = this._groupByCapabilities(results, retainChunks);

			var executionRequests = [];
			Object.keys(capabilitiesGrouped).forEach(function (capability) {
				var originalRequest = JSON.parse(response.meta.originalRequest);
				var originalExecutionRequest = {};
				originalRequest.executionRequests.forEach(function (execRequest) {
					if (execRequest.capabilityId == capability) {
						originalExecutionRequest = execRequest;
					}
				});
				executionRequests.push(this._prepareExecutionRequest(capability, capabilitiesGrouped[capability], originalExecutionRequest));
			}.bind(this));

			var transactionId = response.transactionId;

			var combineRequest = JSON.parse(response.meta.originalRequest);
			if (combineRequest.callbackHandler) {
				combineRequest.callbackHandler = this._getCallbackHandlerName(combineRequest.callbackHandler);
			}
			combineRequest.transactionId = transactionId;
			combineRequest.executionRequests = executionRequests;

			// Perform the combine request
			var inputs = {};
			inputs['request'] = combineRequest;
			var result = sn_fd.FlowAPI.getRunner().action('global.recursive_execution_combine_action').inForeground().withInputs(inputs).run();
			var outputs = result.getOutputs();
			var combineResult = outputs['result'];
			return combineResult;
		} catch (e) {
			this.logger.error("GenAILargeInputHandler: Error creating combine request for recursive execution: " + e);
			return null;
		}
    },

    processErrored: function(response) {
        this.logger.error("GenAILargeInputHandler: Recursive execution error");
    },

    processCancelled: function(response) {
        this.logger.error("GenAILargeInputHandler: Recursive execution cancelled");
    },

	_getCallbackHandlerName: function (callbackHandlerSysId) {
		var scriptIncludeGr = new GlideRecord("sys_script_include");
		if (scriptIncludeGr.get(callbackHandlerSysId)) {
			return scriptIncludeGr.getValue("name");
		}

		return "";
	},

	_getLargeInputHandler: function (capabilityId, definitionId, extensionPoint) {
		// Get extension point instances
		var extensionInstances = new GlideScriptedExtensionPoint().getExtensions(extensionPoint);
		try {
			for (var i = 0; i < extensionInstances.length; i++) {
				if (extensionInstances[i].validateHandler(capabilityId, definitionId)) {
					return extensionInstances[i];
				}
			}
		} catch (e) {
			this.logger.error("GenAILargeInputHandler: Unable to resolve combine extension point, falling back to default");
        }

		// Return the last instance which is default
		return extensionInstances[extensionInstances.length - 1];
	},

    type: 'GenAILargeInputHandler'
};
