function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || typeof tz_annotation == "undefined") {
		return;
	}
	
	var triggersWithTz = ["daily", "weekly", "monthly", "day_and_month_in_year", "week_in_month", "day_week_month_year"];

  if (triggersWithTz.includes(newValue)) {
		tz_annotation.parentNode.style.display = "block";
	} else {
		tz_annotation.parentNode.style.display = "none";
	}
}
