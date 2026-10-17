// Service APIs must be defined in the "Services" namespace - leave the "Services." prefix on the class name and prototype

Services.UpdateListener = Class.create();
Services.UpdateListener.prototype = {
    initialize: function() {
        // Place any Service API initialization code here - runs each time an API is called on this Service
    },

	/**
     * check for updates on the specified records
     *
     * @param parms - object
     *			.listenFor - array of table+sys_id to check for updates
     *			.lastPoll - optional time since the last check, if set, only updates after lastPoll are reported
     *			.processor - optional processor that will passed each reported record. the returned valued is attached to the result
     *
     */
	poll: function(parms) {
		var updated = [];
		var listenFor=new JSON().decode(parms.listenFor);
		for(var table in listenFor) {
			var fieldNames = listenFor[table].fields;
			var qry = this._query(table, listenFor[table].ids, parms.lastPoll);
			if (qry.hasNext()) {
				while(qry.next()) {
					var update = {
						sys_id : qry.getUniqueValue(),
						table : table,
					}
					if (JSUtil.notNil(parms.processor)) {
						var processor = Services.UpdateListener.processors[parms.processor];
						processor.call(update, qry);
					}
					updated.push(update);
				}
			}
		}
		this.data.updated = updated;
	},
	
	_query: function(table, ids, lastPoll) {
		var qry = new GlideRecord(table);
		if (qry.isValid()) {
			qry.addQuery("sys_id", ids);
			qry.addQuery("sys_updated_on", ">=", lastPoll);
			qry.query();
		}
		return qry;
	},

    type: 'UpdateListener'
}

Services.UpdateListener.processors = {};

Services.UpdateListener.processors.workflowUI = function(gr) {
	var scratchpad = new JSON().decode(gr.scratchpad);
	this.ui = scratchpad.ui;
}
