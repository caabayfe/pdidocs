var UXACohortTransformer = Class.create();
UXACohortTransformer.prototype = {
    initialize: function() {},

    transform: function(response, uxaDTO) {
        const startDate = (new GlideDateTime(uxaDTO.getStartTime())).getLocalDate();
        const endDate = (new GlideDateTime(uxaDTO.getEndTime())).getLocalDate();
        const bucketType = uxaDTO.getBucketType();

        /**
         * Create ResponseSet from response:
         * responseSet = {
         * 		date : {
         * 			userCount,
         * 			bucketSet	
         * 		}
         * 	}
         */
        const responseSet = {};
        response.forEach(row => {
            const bucketSet = {};
            row.buckets.forEach(bucket => {
                bucketSet[new GlideDateTime(bucket.date).getDate().toString()] = bucket.usersCount;
            });
            const responseSetValueObj = {};
            responseSetValueObj[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = row.usersCount;
            responseSetValueObj["bucketSet"] = bucketSet;
            responseSet[new GlideDateTime(row.date).getDate().toString()] = responseSetValueObj;
        });

        //Generate Date Range
        const dateRange = this.getDateRange(startDate, endDate, bucketType);

        const cohortArray = [];
        //FirstRow
        const avgRetentionsFirstRow = {};
        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.TYPE] = "UXA_COHORT_AVRAGE_ROW";
        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = 0;
        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.PERCENT] = 0;
        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS] = {};

        cohortArray.push(avgRetentionsFirstRow);

        let rowCounter = 0;
        let firstRowFlag = true;

        dateRange.forEach(cohortRowStartDate => {
            let cohortRowEndDate = endDate;

            const cohortRow = {};
            cohortRow[UXAConstants.COHORT_ATTRIBUTES.DATE] = (new GlideDateTime(cohortRowStartDate)).toString();

            //Converting to string for lookup in set
            let cohortRowStartDateStr = cohortRowStartDate.toString();

            const cohortRowBuckets = {};
            if (responseSet[cohortRowStartDateStr]) {
                const rowTotalUserCount = responseSet[cohortRowStartDateStr].usersCount;
                cohortRow[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = rowTotalUserCount;

                //Update first usersCount
                avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] += rowTotalUserCount;

                const bucketSet = responseSet[cohortRowStartDateStr].bucketSet;
                let index = 0;

                //this.updateDate(cohortRowStartDate, bucketType);
                //update each column of a cohort row
                while (cohortRowStartDate.compareTo(cohortRowEndDate) <= 0) {
                    let bucketStartDateStr = cohortRowStartDate.toString();

                    const bucket = this.getBucket(new GlideDateTime(cohortRowStartDate), 0);

                    //If present in set, update the count, else update to 0
                    if (bucketSet[bucketStartDateStr]) {
                        bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = bucketSet[bucketStartDateStr];
                        bucket[UXAConstants.COHORT_ATTRIBUTES.PERCENT] = (100 * bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT]) / rowTotalUserCount;
                    }
                    //  else {
                    //     bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = 0;
                    // }

                    //firstRowFlag used to create/update first row fields;
                    if (firstRowFlag)
                        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][index] = this.getBucket(bucket.date, bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT]);
                    else {
                        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][index][UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] += bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT];
                    }

                    //Update first row count and percent
                    const bucketCountSofar = avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][index][UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT];
                    const totalCountSoFar = avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT];

                    avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][index][UXAConstants.COHORT_ATTRIBUTES.PERCENT] = totalCountSoFar ? (100 * bucketCountSofar) / totalCountSoFar : 0;

                    cohortRowBuckets[index] = bucket;
                    this.updateDate(cohortRowStartDate, bucketType);
                    index++;
                }
                cohortRowBuckets[index - 1][UXAConstants.COHORT_ATTRIBUTES.IS_PARTIAL] = this.isEndDateInFuture(cohortRowBuckets[index - 1][UXAConstants.COHORT_ATTRIBUTES.DATE], bucketType);
            } else {
                cohortRow[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = 0;
                let index = 0;
                // this.updateDate(cohortRowStartDate, bucketType);
                while (cohortRowStartDate.compareTo(cohortRowEndDate) <= 0) {
                    const bucket = this.getBucket((new GlideDateTime(cohortRowStartDate)).toString());

                    if (firstRowFlag)
                        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][index] = this.getBucket(bucket.date, bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT]);


                    cohortRowBuckets[index] = bucket;
                    this.updateDate(cohortRowStartDate, bucketType);
                    index++;
                }
                cohortRowBuckets[index - 1][UXAConstants.COHORT_ATTRIBUTES.IS_PARTIAL] = this.isEndDateInFuture(cohortRowBuckets[index - 1][UXAConstants.COHORT_ATTRIBUTES.DATE], bucketType);
            }
            firstRowFlag = false;
            cohortRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS] = cohortRowBuckets;
            cohortArray.push(cohortRow);
            rowCounter++;
        });

        //Update Avg Retention Row
        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.PERCENT] = avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] ? 100 : 0;
        avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][rowCounter - 1][UXAConstants.COHORT_ATTRIBUTES.IS_PARTIAL] = this.isEndDateInFuture(avgRetentionsFirstRow[UXAConstants.COHORT_ATTRIBUTES.BUCKETS][rowCounter - 1][UXAConstants.COHORT_ATTRIBUTES.DATE], bucketType);

        return cohortArray;
    },

    isEndDateInFuture: function(startDate, bucketType) {
        // this method will compare the startDate with the bucketDate range and will decide the date is past or present. 
        const endDate = new GlideDateTime(startDate);
        this.updateDate(endDate, bucketType);

        const currentDate = new GlideDateTime();
        return endDate.compareTo(currentDate) > 0;
    },
    getBucket: function(date, usersCount = 0, percent = 0, isPartial = false) {
        const bucket = {};
        bucket[UXAConstants.COHORT_ATTRIBUTES.DATE] = date?.toString();
        bucket[UXAConstants.COHORT_ATTRIBUTES.USERS_COUNT] = usersCount;
        bucket[UXAConstants.COHORT_ATTRIBUTES.PERCENT] = percent;
        bucket[UXAConstants.COHORT_ATTRIBUTES.IS_PARTIAL] = isPartial;
        return bucket;
    },

    //UTC date, type of GlideDateTime
    updateDate: function(date, bucketType) {
        switch (bucketType) {
            case UXAConstants.TREND_INTERVAL.DAY:
                date.addDaysUTC(1); // Move to the next day
                break;
            case UXAConstants.TREND_INTERVAL.WEEK:
                date.addDaysUTC(7); // Move to the next week
                break;
            case UXAConstants.TREND_INTERVAL.MONTH:
                date.addMonthsUTC(1); // Move to the next month
                break;
            default:
                var errorMsg = gs.getMessage("Invalid period specified. Use 'day', 'week', or 'month'.");
                gs.addErrorMessage(errorMsg);
                break;
        }
    },

    getDateRange: function(startDate, endDate, period) {
        startDate = new GlideDateTime(startDate);
        var result = [];

        switch (period) {
            case UXAConstants.TREND_INTERVAL.DAY:
                while (startDate.compareTo(endDate) <= 0) {
                    result.push(startDate.getDate()); // Add the current date
                    startDate.addDaysUTC(1); // Move to the next day
                }
                break;

            case UXAConstants.TREND_INTERVAL.WEEK:
                // Get the start of the week (Monday)
                startDate = this.getStartOfWeek(startDate);
                while (startDate.compareTo(endDate) <= 0) {
                    result.push(startDate.getDate()); // Add the Monday of each week
                    startDate.addDaysUTC(7); // Move to the next week
                }
                break;

            case UXAConstants.TREND_INTERVAL.MONTH:
                endDate.setDayOfMonthUTC(31);
                while (startDate.compareTo(endDate) <= 0) {
                    result.push(this.getStartOfMonth(startDate).getDate());
                    //result.push(startDate.getMonthUTC() + '-' + startDate.getYearUTC()); // Add the month and year
                    startDate.addMonthsUTC(1); // Move to the next month
                }
                break;

            default:
                var errorMsg = gs.getMessage("Invalid period specified. Use 'day', 'week', or 'month'.");
                gs.addErrorMessage(errorMsg);
                break;
        }

        return result;
    },

    // Helper function to get the start of the week (Monday)
    getStartOfWeek: function(gdt) {
        const dayOfWeek = gdt.getDayOfWeekUTC();
        const daysToSubtract = (dayOfWeek - 1); // Monday is day 1
        gdt.addDaysUTC(-daysToSubtract);
        return gdt;
    },

    // Helper function to get the start of the month
    getStartOfMonth: function(gdt) {
        const dayOfMonth = gdt.getDayOfMonthUTC();
        const daysToSubtract = (dayOfMonth - 1);
        gdt.addDaysUTC(-daysToSubtract);
        return gdt;
    },

    type: 'UXACohortTransformer'

};
