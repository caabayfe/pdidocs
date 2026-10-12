var BusinessCalendarSpanUtils = Class.create();
BusinessCalendarSpanUtils.prototype = {
    initialize: function() {
		this.BUSINESS_CALENDAR_SPAN = 'business_calendar_span';
		this.BUSINESS_CALENDAR_SPAN_NAME = 'business_calendar_span_name';
		this.YEAR_CALENDAR_SYS_ID = '017d95a353f3001076bcddeeff7b121a';
		this.QUARTER_CALENDAR_SYS_ID = '857ddda353f3001076bcddeeff7b12af';
		this.MONTH_CALENDAR_SYS_ID = '4d7ddda353f3001076bcddeeff7b12b1';
		this.WEEK_CALENDAR_SYS_ID = '2d87b2e7530c101076bcddeeff7b1225';
    },

	deleteWeekSpanEntriesBeforeTimestamp: function (timestamp) {
	        // query span entries which has start < timestamp
		var sw = new GlideStopWatch();
		var gr = new GlideRecord("business_calendar_span");
		gr.addQuery("calendar", "IN", [this.WEEK_CALENDAR_SYS_ID]);
		gr.addQuery("start", "<", timestamp);
		gr.query();
		var count = gr.getRowCount();
		if(count ==0){
			gs.print("No Week Span entries to delete before: "+ timestamp);
			return;
		}

		var nameSysIdList = '';
		var spanSysIdList = '';
		while (gr.next()) {
			var spanNameSysId = gr.getValue('span_name');
			var spanSysId = gr.getValue('sys_id');
			nameSysIdList =  (nameSysIdList == '') ? spanNameSysId : nameSysIdList + ',' + spanNameSysId;
			spanSysIdList =  (spanSysIdList == '') ? spanSysId : spanSysIdList + ',' + spanSysId;
		}

		gs.log("Count of records from business_calendar_span " + count + " in time and query time: " +  sw.getTime());

            // delete from business_calendar_span table
		this.deleteListOfSysidsFromTable(spanSysIdList, this.BUSINESS_CALENDAR_SPAN);
		gs.log("Time taken to delete business_calendar_span: " +  sw.getTime());

		// delete from business_calendar_span_name table
		this.deleteListOfSysidsFromTable(nameSysIdList, this.BUSINESS_CALENDAR_SPAN_NAME);
		gs.log("Time taken to delete business_calendar_span_name: " +  sw.getTime());

	},

	deleteListOfSysidsFromTable: function (sysIdList, table) {
		var md = new GlideMultipleDelete(table);
		md.addQuery("sys_id", "IN", sysIdList);
		md.execute();
	},

	destroyJob: function(){
            var gr = new GlideRecord("sys_trigger");
            if (gr.get("912941d7434586104951642b75b8f295")) {
                gs.info("Deleting trigger job 912941d7434586104951642b75b8f295");
                gr.setWorkflow(false);
                gr.deleteRecord();
            }
	},

    type: 'BusinessCalendarSpanUtils'
};
