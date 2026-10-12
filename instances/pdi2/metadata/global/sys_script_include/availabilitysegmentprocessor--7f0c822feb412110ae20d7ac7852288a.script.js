var AvailabilitySegmentProcessor = Class.create();
AvailabilitySegmentProcessor.prototype = {
	initialize: function() {
		this.CONSTANTS = new global.AvailabilityConstants();

		// key is availability type, value is map of segments to calculate for the type
		this.BUCKET_MAP = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.ANNUALLY] = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.MONTHLY] = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.WEEKLY] = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.DAILY] = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.LAST_12_MONTHS] = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.LAST_30_DAYS] = {};
		this.BUCKET_MAP[this.CONSTANTS.AVAIL_TYPES.LAST_7_DAYS] = {};

		/**
		 * Define the methods needed to support segment boundary checking,
		 * segment iteration, segment type checking for each availability type
		 * - Two types of availability intervals
		 *   - fixed (yearly, monthly, weekly, daily) based off begin and end
		 *   - rolling (last x months/days) based off the current date
		 * - fixed availability types define decrementSegment() method to add outage across multiple segments
		 */
		this.TYPES = {};
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.ANNUALLY] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.FIXED,
			beginningOfSegment: function(date) { return gs.beginningOfYear(date); },
			endOfSegment: function(date) { 
				var endOfYear = new GlideDateTime(gs.endOfYear(date)); 
				// additional second to roll end date to midnight (display & calc)
				endOfYear.addSeconds(1);
				return endOfYear;
			},
			decrementSegment: function (date, number) { return date.addYearsLocalTime(number); },
		});
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.MONTHLY] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.FIXED,
			beginningOfSegment: function(date) { return gs.beginningOfMonth(date); },
			endOfSegment: function(date) { 
				var endOfMonth = new GlideDateTime(gs.endOfMonth(date));
				// additional second to roll end date to midnight (display & calc)
				endOfMonth.addSeconds(1);
				return endOfMonth;
			},
			decrementSegment: function(date, number) { return date.addMonthsLocalTime(number); },
		});
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.WEEKLY] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.FIXED,
			beginningOfSegment: function(date) { return gs.beginningOfWeek(date); },
			endOfSegment: function(date) { 
				var endOfWeek = new GlideDateTime(gs.endOfWeek(date));
				// additional second to roll end date to midnight (display & calc)
				endOfWeek.addSeconds(1);
				return endOfWeek;
			},
			decrementSegment: function(date, number) { return date.addWeeksLocalTime(number); },
		});
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.DAILY] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.FIXED,
			beginningOfSegment: function(date) { return gs.beginningOfDay(date); },
			endOfSegment: function(date) { 
				var endOfDay = new GlideDateTime(gs.endOfDay(date));
				// additional second to roll end date to midnight (display & calc)
				endOfDay.addSeconds(1);
				return endOfDay;
			},
			decrementSegment: function(date, number) { return date.addDaysLocalTime(number); },
		});
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.LAST_12_MONTHS] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.ROLLING,
			beginningOfSegment: function() {
				// segment should include today, so we subtract 12 months from the beginning of the next day
				var beginningOfDate = new GlideDateTime(gs.beginningOfTomorrow());
				beginningOfDate.addMonthsLocalTime(-12);
				return beginningOfDate.getValue();
			},
			endOfSegment: function() {
				// end at midnight the next day
				return gs.beginningOfTomorrow();
			},
		});
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.LAST_30_DAYS] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.ROLLING,
			beginningOfSegment: function() {
				// segment should include today, so we subtract 12 months from the beginning of the next day
				var beginningOfDate = new GlideDateTime(gs.beginningOfTomorrow());
				beginningOfDate.addDaysLocalTime(-30);
				return beginningOfDate.getValue();
			},
			endOfSegment: function() {
				// end at midnight the next day
				return gs.beginningOfTomorrow();
			},
		});
		this.TYPES[this.CONSTANTS.AVAIL_TYPES.LAST_7_DAYS] = Object.freeze({
			type: this.CONSTANTS.SEGMENT_TYPES.ROLLING,
			beginningOfSegment: function() {
				// segment should include today, so we subtract 12 months from the beginning of the next day
				var beginningOfDate = new GlideDateTime(gs.beginningOfTomorrow());
				beginningOfDate.addDaysLocalTime(-7);
				return beginningOfDate.getValue();
			},
			endOfSegment: function() {
				// end at midnight the next day
				return gs.beginningOfTomorrow();
			},
		});
		Object.freeze(this.TYPES);
	},

	/**
	 * Return segments to calculate for an availability type
	 * @param {String} type - availability type
	 * @return {Object|null}
	 */
	getSegments: function(type) {
		if (this.BUCKET_MAP[type])
			return this.BUCKET_MAP[type];
		return null;
	},

	/**
	 * Return all segments grouped by availability type
	 * @return {Object}
	 */
	getBucketMap: function () {
		return this.BUCKET_MAP;
	},

	/**
	 * Create segment and associate to an availability type
	 * @param {String} type - availability type
	 * @param {GlideDateTime} segmentBegin
	 * @param {GlideDateTime} segmentEnd
	 */
	_generateSegment: function(type, segmentBegin, segmentEnd) {
		if (!type)
			return;
		else if (!segmentBegin || !segmentBegin.isValid() || !segmentEnd || !segmentEnd.isValid())
			return;

		var typeBucket = this.BUCKET_MAP[type];

		// form hashkey from string of begin and end unix timestamp
		var key = segmentBegin.getNumericValue().toString() + segmentEnd.getNumericValue().toString();

		// create new segment in bucket if it does not exist
		if (!typeBucket[key])
			// instead of actual outages, start and end index of outages are tracked
			// since outages are kept in increasing order by start date
			// initial values for indexes are -1 to skip outage iteration in calculations
			typeBucket[key] = {
				begin: segmentBegin.getNumericValue(),
				end: segmentEnd.getNumericValue(),
				// beginGDT: segmentBegin.getValue(),
				// endGDT: segmentEnd.getValue(),
				startIndex: -1,
				endIndex: -1 // endIndex should be exclusive
			};
	},

	/**
	 * Generate all segments for an availability type that may be calculated between begin and end
	 * @param {String} type - availability type to generate segments to calculate
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_generateSegmentsForType: function(type, begin, end) {
		if (!type)
			return;
		else if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		var typeEnum = this.TYPES[type];

		// get the latest segment to calculate from outage end (outward-most moving inward)
		var segmentBegin = new GlideDateTime(typeEnum.beginningOfSegment(end));
		var segmentEnd = new GlideDateTime(typeEnum.endOfSegment(segmentBegin));

		if (typeEnum.type === this.CONSTANTS.SEGMENT_TYPES.FIXED)
			// loop until all segments between begin and end are created
			while (end.getNumericValue() > segmentBegin.getNumericValue() && begin.getNumericValue() < segmentEnd.getNumericValue()) {
				this._generateSegment(type, segmentBegin, segmentEnd);

				// decrement one segment by adjusting begin and end dates
				typeEnum.decrementSegment(segmentBegin, -1);
				segmentEnd.setValue(typeEnum.endOfSegment(segmentBegin));
			}
		else if (typeEnum.type === this.CONSTANTS.SEGMENT_TYPES.ROLLING)
			this._generateSegment(type, segmentBegin, segmentEnd);
	},

	/**
	 * Generate all segments between begin and end across all availability types
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_generateAllSegments: function(begin, end) {
		if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		for (var type in this.BUCKET_MAP) {
			if (this.BUCKET_MAP.hasOwnProperty(type))
				this._generateSegmentsForType(type, begin, end);
		}
	},

	/**
	 * Add all outages across all applicable segments between begin and end
	 * @param {Array<Object>} outages - index of outage to process in outages array
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_addOutagesToAllSegments: function(outages, begin, end) {
		if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		var outageLength = (outages && outages.length ? outages.length : 0);
		for (var outageIndex = 0; outageIndex < outages.length; outageIndex++) {
			for (var type in this.BUCKET_MAP) {
				if (this.BUCKET_MAP.hasOwnProperty(type))
					this._addOutageToTypeSegments(outages[outageIndex], outageIndex, type, begin, end);
			}
		}
	},

	/**
	 * Add outage to applicable segments of an availability type between begin and end
	 * - associate the outage with the applicable segments for one availability type
	 * @param {Object} outage
	 * @param {Number} outageIndex - index of outage in outages array
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	_addOutageToTypeSegments: function(outage, outageIndex, type, begin, end) {
		if (!outage || !outage.begin || !outage.end)
			return;
		else if (outageIndex === null || !typeof outageIndex === 'number')
			return;
		else if (!begin || !begin.isValid() || !end || !end.isValid())
			return;

		var typeEnum = this.TYPES[type];
		var typeBucket = this.BUCKET_MAP[type];

		/**
		 * Increment indexes in segment to account for additional outage
		 * @param {Number} outageArrIndex - index of outage from larger outage array
		 * @param {GlideDateTime} segmentBegin
		 * @param {GlideDateTime} segmentEnd
		 */
		function _addOutageToSegment(outageArrIndex, segmentBegin, segmentEnd) {
			// form hashkey from string of begin and end unix timestamp
			var key = segmentBegin.getNumericValue().toString() + segmentEnd.getNumericValue().toString();

			// create new segment in bucket if it does not exist
			var existingSegment = typeBucket[key];
			if (!existingSegment)
				return;

			if (existingSegment.startIndex === -1)
				existingSegment.startIndex = outageArrIndex;

			existingSegment.endIndex = outageArrIndex + 1; // endIndex should be exclusive
		};


		var applicableStart = new GlideDateTime(typeEnum.beginningOfSegment(begin));
		var applicableEnd = new GlideDateTime(typeEnum.endOfSegment(end));

		if (outage.end >= applicableStart.getNumericValue() && outage.begin < applicableEnd.getNumericValue()) {
			// convert to GDT to get ISO date format
			var outageEndGDT = new GlideDateTime();
			outageEndGDT.setNumericValue(outage.end);

			// get the latest segment to calculate from outage end (outward-most moving inward)
			var segmentBegin = new GlideDateTime(typeEnum.beginningOfSegment(outageEndGDT));
			var segmentEnd = new GlideDateTime(typeEnum.endOfSegment(segmentBegin));

			if (typeEnum.type === this.CONSTANTS.SEGMENT_TYPES.FIXED)
				// outage may fall across multiple segments, so need to loop appropriately
				while (outage.end > segmentBegin.getNumericValue() && outage.begin < segmentEnd.getNumericValue()) {
					_addOutageToSegment(outageIndex, segmentBegin, segmentEnd);

					// decrement one segment by adjusting begin and end dates
					typeEnum.decrementSegment(segmentBegin, -1);
					segmentEnd.setValue(typeEnum.endOfSegment(segmentBegin));
				}
			else if (typeEnum.type === this.CONSTANTS.SEGMENT_TYPES.ROLLING)
				if (outage.end > segmentBegin.getNumericValue() && outage.begin < segmentEnd.getNumericValue())
					_addOutageToSegment(outageIndex, segmentBegin, segmentEnd);
		}
	},

	/**
	 * Determine the segments for each availability type that need to be calculated
	 * @param {Array<Object>} outages
	 * @param {GlideDateTime} begin
	 * @param {GlideDateTime} end
	 */
	determineWorkingSegments: function(outages, begin, end) {
		if (!begin || !begin.isValid() || !end || !end.isValid())
			return null;

		this._generateAllSegments(begin, end);
		this._addOutagesToAllSegments(outages, begin, end);
	},

	type: 'AvailabilitySegmentProcessor'
};
