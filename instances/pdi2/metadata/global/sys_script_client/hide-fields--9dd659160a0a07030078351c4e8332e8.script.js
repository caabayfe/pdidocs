function onChange(control, oldValue, newValue) { 		
    if (newValue == "daily") {
        g_form.setDisplay('run_dayofweek', false);
        g_form.setDisplay('run_dayofmonth', false);
    }

    if (newValue == "weekly") {
        g_form.setDisplay('run_dayofweek', true);
        g_form.setDisplay('run_dayofmonth', false);
    }

    if (newValue == "monthly") {
        g_form.setDisplay('run_dayofweek', false);
        g_form.setDisplay('run_dayofmonth', true);
    }
}
 
