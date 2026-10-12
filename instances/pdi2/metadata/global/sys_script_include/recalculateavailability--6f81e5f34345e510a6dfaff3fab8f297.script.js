var RecalculateAvailability = Class.create();
RecalculateAvailability.prototype = {
	initialize: function() {
		this.CONSTANTS = new global.AvailabilityConstants();
		this.UTILS = new global.AvailabilityUtils();
		this.timezone = this.UTILS.getTimezoneForCalculation();
	},
	
	processOutageChange: function(currentData, previousData, operation) {
		if (gs.getProperty(this.CONSTANTS.PROP_AVAILABILITY_V2) === 'true') {
			var previousEndDate = previousData.outage && previousData.outage.end ? previousData.outage.end.getGlideObject() : null;
			var currentEndDate = currentData.outage && currentData.outage.end ? currentData.outage.end.getGlideObject() : null;

			// V2 Recalc check
			// In Availability V2, we do not recalculate availability when outage "end" is empty
			// In Availability V1, we recalculate availability when outage "end" is empty (open ended outage)
			if (!previousEndDate && !currentEndDate)
				return;
		}

		if (currentData.cmdb_ci.nil() && operation != "update")
			return; // no CI to calculate against
			
		if (!(currentData.outage.type == "outage" || currentData.outage.type == "planned")) {
			if (!currentData.outage.type.changes())
				return; // not an "outage" outage
				
			if (!(previousData.outage.type == "outage" || previousData.outage.type == "planned"))
				return; // not an "outage" outage
		}

		if (!this.UTILS.hasCommitments(currentData.cmdb_ci.sys_id))
			return;


		if (!this.timezone) {
			var offeringsCommitmentGr = this.UTILS.getOfferingToCommitmentGr(currentData.cmdb_ci.sys_id, null);
			if (offeringsCommitmentGr.getRowCount() < 1)
				offeringsCommitmentGr = this.UTILS.getCIsToCommitmentGr(currentData.cmdb_ci.sys_id, null);
			var commitmentsArr;
			while (offeringsCommitmentGr.next()) {
				var offeringCommitmentTz = offeringsCommitmentGr.getValue('service_commitment.timezone');
				var commitmentsGr = this.UTILS.getCommitmentsByTimezone(currentData.cmdb_ci.sys_id, null, offeringCommitmentTz);
				while (commitmentsGr.next()) {
					commitmentsArr.push(commitmentsGr.sys_id);
				}
				var oldTZ = gs.getSession().getTimeZoneName();
				try {
					gs.print("Setting session timezone to " + offeringCommitmentTz + " for availability calculations");
					gs.getSession().setTimeZoneName(offeringCommitmentTz);
					this.recalcAvailability(currentData, previousData, operation, commitmentsArr);
				} finally {
					gs.getSession().setTimeZoneName(oldTZ);
					gs.print("Restored session timezone to " + oldTZ + " after availability calculations");
				}
			}
		} else {
			var oldTZ = gs.getSession().getTimeZoneName();
			try {
				gs.print("Setting session timezone to " + this.timezone + " for availability calculations");
				gs.getSession().setTimeZoneName(this.timezone);
				this.recalcAvailability(currentData, previousData, operation, null);
			} finally {
				gs.getSession().setTimeZoneName(oldTZ);
				gs.print("Restored session timezone to " + oldTZ + " after availability calculations");
			}
		}
	},
	
	recalcAvailability: function(currentData, previousData, operation, commitmentsArr) {
		var newEndVal = currentData.outage.end ? currentData.outage.end.getGlideObject().getNumericValue() : new GlideDateTime(gs.nowDateTime()).getNumericValue();
		var newBeginVal = currentData.outage.begin.getGlideObject().getNumericValue();
	
		if (operation == "delete" || operation == "insert") {
			this.updateCalc(newBeginVal, newEndVal, currentData, commitmentsArr);
	
			return;
		}
	
		// this is an update
		var oldEndVal = previousData.outage.end.getGlideObject().getNumericValue();
		var oldBeginVal = previousData.outage.begin.getGlideObject().getNumericValue();
		var intersect = this.isIntersect(oldBeginVal, oldEndVal, newBeginVal, newEndVal);
		var previous_ci_class = previousData.ci_item.sys_class_name;
	
		if (currentData.cmdb_ci.changes()) {
			this.updateCalc(newBeginVal, newEndVal, currentData, commitmentsArr);
			this.updateCalc(oldBeginVal, oldEndVal, previousData, commitmentsArr);

			return;
		}
	
		if (previousData.begin.nil() || previousData.end.nil()) {
			// this is our first time calculating for this outage 
			this.updateCalc(newBeginVal, newEndVal, currentData, commitmentsArr);
			return;
		}
	
		// Recalculate if outage changed
		if (currentData.outage.changes()) {
			// recalc previous and current if they are type outage only
			if (currentData.outage.type == "outage" || currentData.outage.type == "planned")
				this.updateCalc(newBeginVal, newEndVal, currentData, commitmentsArr);

			if (previousData.outage.type == "outage" || previousData.outage.type == "planned")
				this.updateCalc(oldBeginVal, oldEndVal, previousData, commitmentsArr);
	
			return;
		}
	
		// Outage type didn't change, so just need to recalc dates covered by
		// the difference between new and old Start times, and dates covered by 
		// difference between new and old End times
		if (intersect) {
			this.updateCalc(newEndVal, oldEndVal, currentData, commitmentsArr); // recalc days between new and old End values
			this.updateCalc(newBeginVal, oldBeginVal, currentData, commitmentsArr); // recalc days between new and old Begin values
		} else {
			this.updateCalc(newBeginVal, newEndVal, currentData, commitmentsArr); // recalc days between new interval
			this.updateCalc(oldBeginVal, oldEndVal, currentData, commitmentsArr); // recalc days between old interval
		}
	},

	updateCalc: function(begin, end, ci, commitmentsArr) {
		if (begin == 0 || end == 0)
			return;
		low = Math.max(0, Math.min(begin, end));
		high = Math.max(0, begin, end);

		if (gs.getProperty(this.CONSTANTS.PROP_AVAILABILITY_V2) === 'true') {
			var begin = new GlideDateTime();
			begin.setNumericValue(low);
			var end = new GlideDateTime();
			end.setNumericValue(high);

			var as = new global.AvailabilitySummarizerV2();
			as.setCi(ci.cmdb_ci);
			if (commitmentsArr != null)
				as.setCommitments(commitmentsArr);
			as.summarize(begin, end);
		} else
			this.legacyUpdateCalc(low, high, ci);
		
	},

	legacyUpdateCalc: function(low, high, ci) {
		var today = new GlideDateTime(gs.beginningOfTomorrow()).getNumericValue();
		/* This done to account for one extra day of calcualtion to handle the case where the time component of begin date is higher than the
		time component of the end date of the outage. This is used to break in the loop and not for actaul calculations.
		*/	
		var endDatePlusOne = high + (24 * 3600 * 1000); 	
			
		while (low <= endDatePlusOne && low < today) {
			var cur = new GlideDateTime();
			cur.setNumericValue(low);
			gs.print("Calculating availability for Configuration Item: " + ci.cmdb_ci.getDisplayValue() + ", date: " + cur.getDisplayValue()); 
			var d = new GlideDateTime();
			d.setNumericValue(low);
			var ac = new AvailabilitySummarizer();
			ac.setCI(ci.cmdb_ci.toString());
			ac.summarize(d);
	
			if (!gs.isLastDayOfWeek(d)) {
				var week = new GlideDateTime(gs.beginningOfThisWeek()).getNumericValue();
				if (low < week) {
					gs.print("Recalculating relevant week");
					ac.summarize(gs.endOfWeek(d));
				}
			}
					
			if (!gs.isLastDayOfMonth(d)) {
				var month = new GlideDateTime(gs.beginningOfThisMonth()).getNumericValue();
				if (low < month) {
					gs.print("Recalculating relevant month");
					ac.summarize(gs.endOfMonth(d));
				}
			}
			if (!gs.isLastDayOfYear(d)) {
				var year = new GlideDateTime(gs.beginningOfThisYear()).getNumericValue();
				if (low < year) {
					gs.print("Recalculating relevant year");
					ac.summarize(gs.endOfYear(d));
				}
			}
			low += 24 * 3600 * 1000;
	}
	
		var twelveMonths = new GlideDateTime(gs.monthsAgoStart(12)).getNumericValue();
		if (high > twelveMonths) {
			gs.print("Recalculating last 7 days, last 30 days, last 12 months availability for Configuration Item: " + ci.cmdb_ci.getDisplayValue()); 
			ac.summarize(gs.beginningOfYesterday());
			// create or update Monthly availability records for last 12 months
			for (var i = 0; i < 12; i++)
				ac.summarize(new GlideDateTime(gs.monthsAgoEnd(i)));
		}
	},
	
	isIntersect: function (oldBegin, oldEnd, newBegin, newEnd) {
		if (newBegin > oldEnd || newEnd < oldBegin)
			return false;
	
		return true;
	},
    type: 'RecalculateAvailability'
};
