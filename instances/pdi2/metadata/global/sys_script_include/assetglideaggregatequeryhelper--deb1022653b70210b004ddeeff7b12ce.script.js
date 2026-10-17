var AssetGlideAggregateQueryHelper = Class.create();

/**
 * Aggregate queries will limit the loaded result set in the app node to 100K.
 *
 * This utility will provide a way to get past that limit by querying multiple times with a window size
 */
AssetGlideAggregateQueryHelper.prototype = {

	PROPERTY_MAX_AGGREGATE_LIMIT: 'glide.db.max.aggregates',

	initialize: function(tablename, encodedQuery, groupByFields, orderByField) {
		this.tablename = tablename;
		this.encodedQuery = encodedQuery;
		this.groupByFields = groupByFields || ['sys_id'];
		this.maxAggLimit = Number(gs.getProperty(this.PROPERTY_MAX_AGGREGATE_LIMIT, 100000));
		this.currentWindowStart = 0;
		this.currentWindowEnd = this.maxAggLimit;
		this.currentCursorPosition = 0; // Position within the current window while iterating through the resultset
		this.orderBy = orderByField;
		this.nextAggRowCnt = 0;
		this.aggregator = this._initializeGAWithLimitAndQuery();
	},

	_initializeGAWithLimitAndQuery: function() {
		var aggregator = new GlideAggregate(this.tablename);
		if (this.encodedQuery) {
			aggregator.addEncodedQuery(this.encodedQuery);
		}

		if (this.orderBy) {
			aggregator.orderBy(this.orderBy);
		}

		this.groupByFields.forEach(function(groupingField) {
			aggregator.groupBy(groupingField);
		});

		aggregator.addAggregate('COUNT');
		aggregator.chooseWindow(this.currentWindowStart, this.currentWindowEnd);
		aggregator.query();
		this.currentCursorPosition = 0;

		return aggregator;
	},

	next: function() {
		// If you are within the current window boundary, just return the underlying GA's return value
		if (this.currentCursorPosition < this.maxAggLimit) {
			this.currentCursorPosition += 1;
			return this._getNext();
		}
		this.currentCursorPosition += 1;

		this._incrementWindow();

		this.aggregator = this._initializeGAWithLimitAndQuery();
		this.currentCursorPosition += 1;
		this._getNext();

		return this.aggregator;
	},

	// we will increment the window as 0-->limit, limit-->limit+limit
	// even though the retrieval overlaps at the 'limit', in each window
	// we actually return/process up to limit-1
	_incrementWindow: function() {
		this.currentWindowStart = this.currentWindowEnd;
		this.currentWindowEnd = this.currentWindowStart + this.maxAggLimit;
	},

	getAggregateRecord: function() {
		return this.aggregator;
	},

	getValue: function(fieldName) {
		return this.aggregator.getValue(fieldName);
	},

	hasNext: function() {
		return this.aggregator.hasNext();
	},

	_getNext: function() {
		this.nextAggRowCnt += 1;
		return this.aggregator.next();
	},

	type: 'AssetGlideAggregateQueryHelper',
};
