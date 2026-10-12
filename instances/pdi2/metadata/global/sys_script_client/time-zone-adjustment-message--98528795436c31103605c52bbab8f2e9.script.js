function onLoad() {
	var ga = new GlideAjax('ScheduledImportSetRunTime');
	ga.addParam('sysparm_name', 'date');
	ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
	ga.getXML(dateHere); 
	function dateHere(response) {
		var result = response.responseXML.getElementsByTagName("result")[0];
		var run_time = result.getAttribute("run_time");

		// The run_time represents only the time part in UTC, the date part can only be 
		// 1970-01-01, 1970-01-02 or 1969-12-31, which corresponds to dateOffset of 0, 1, and -1 respectively
		var dateOffsetMap = new Map();
		dateOffsetMap.set('1970-01-01', 0);
		dateOffsetMap.set('1970-01-02', 1);
		dateOffsetMap.set('1969-12-31', -1);
		var dateOffset = dateOffsetMap.get(run_time.slice(0,10));
		var timeOffset = parseInt(result.getAttribute("timeOffset"));
		var UTCTime = parseInt(run_time.slice(11,13));
		var localTime = UTCTime + timeOffset;
		if (localTime >= 24)
			dateOffset++;
		else if (localTime < 0)
			dateOffset--;

		if (Number.isNaN(dateOffset) || dateOffset == 0)
			return;

		var originalRunDayOfWeek = g_form.getValue('run_dayofweek');
		var dayArray = [];
			dayArray["0"] = "Sunday";
			dayArray["1"] = "Monday";
			dayArray["2"] = "Tuesday";
			dayArray["3"] = "Wednesday";
			dayArray["4"] = "Thursday";
			dayArray["5"] = "Friday";
			dayArray["6"] = "Saturday";

		var dayOfWeek = (parseInt(originalRunDayOfWeek) + dateOffset) % dayArray.length;
		if(dayArray[dayOfWeek] != null)
			g_form.showFieldMsg('run_dayofweek', "In your timezone, the job will run on " + dayArray[dayOfWeek] + ". The record was created in a different timezone, which is reflected in the day of the week specified above.");
	}   
}
