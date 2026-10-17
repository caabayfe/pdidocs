var PIWBPredictionProcessor = Class.create();
PIWBPredictionProcessor.prototype = {
    tableName: '[TABLE_NAME_PLACEHOLDER]',

    initialize: function() {
    },

	getTableName: function() {
		return this.tableName;
	},

    process: function(recordGr) {
		// Make sure to check table name relation here
		// Can be customized to check any relation, e.g. parent/child relation
		// Do return false if it fails the check
        if (this.getTableName() !== recordGr.getTableName())
			return false;

		var usecaseGr = new GlideRecord(PIWBConstants.TABLES.USECASE);
		usecaseGr.addActiveQuery();
		usecaseGr.addQuery('template.table', this.getTableName());
		usecaseGr.orderBy('order');
		usecaseGr.query();
		while (usecaseGr.next()) {
			// prediction logic for records on this table
			'[PREDICTION_LOGIC_PLACEHOLDER]';
		}

		return true;
    },

    type: 'PIWBPredictionProcessor'
};
