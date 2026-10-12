var AnalyticsCachePrefetchAPI = Class.create();
AnalyticsCachePrefetchAPI.prototype = {
    initialize: function(gr) {
		this.gr = gr;
		this.key = gr.key + "";
		this.keyHash = gr.key_hash;
		this.createdBy = gr.sys_created_by;

		var request = JSON.parse(gr.request);
		this.request = request.requestBody || gr.request;
		this.serviceClassName = request.serviceClassName;
		this.expirationTimeInSeconds = this._getExpirationTimeInSeconds(gr) + "";
		this.refreshCounter = parseInt(gr.prefetch_refresh_counter);
	},

    reload: function() {
        var params = this._generateParameterMap();
        var impUser = new GlideImpersonate();

        try {
			// Impersonate with user who first created the cache entry
            impUser.impersonate(this.createdBy);

			// Call actual provider to generate the fresh data
			SNC.ScriptableAnalyticsCacheService.getData(this.request, JSON.stringify(params), this.serviceClassName);

			// Update refresh counter
            var newGr = this._getCacheGr(this.keyHash);
            if (newGr.next()) {
                newGr.setValue('is_queued', false); // This makes cache entry can be submitted to queue again
                newGr.setValue('prefetch_refresh_counter', this.refreshCounter + 1);
				newGr.setWorkflow(false);
                newGr.update();
            }
        } catch (e) {
			// If any errors in data generation then reset prefetch enabled to create refresh event again
			this.gr.deleteRecord();

            gs.warn(e);
        } finally {
			// End impersonation
            impUser.undo();
        }
    },

	_getCacheGr: function(keyHash) {
		var gr = new GlideRecord('sys_analytics_cache');
		gr.addEncodedQuery('key_hash=' + keyHash);
		gr.setLimit(1);
		gr.query();

		return gr;
	},

	_generateParameterMap: function() {
		return {
            cache_enabled: "true",
            expiration_time_duration: this.expirationTimeInSeconds + "",
            prefetch_key: this.key + "",
            prefetch_enabled: "true"
        };
	},

	_getExpirationTimeInSeconds: function(gr) {
		var expiresAt = this._getNumericValue(gr.expiration_time);
        var createdAt = this._getNumericValue(gr.sys_created_on);

		return (expiresAt - createdAt) / 1000;
	},

	_getNumericValue: function(value) {
		var gdt = new GlideDateTime();
		gdt.setDisplayValue(value);

		return gdt.getNumericValue();
    },

    type: 'AnalyticsCachePrefetchAPI'
};
