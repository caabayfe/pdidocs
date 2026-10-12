function validate(value) {
    // empty fields are still valid dates 
    if(!value) 
        return true; 

    // We "should" have the global date format defined, but there's always that edge case... 
    if (typeof g_user_date_time_format !== 'undefined') 
        return isDate(value, g_user_date_time_format) ? true : getMessage("Invalid Date"); 

    // if we don't have that defined, we can always try guessing 
    return parseDate(value) !== null ? true : getMessage("Invalid Date"); 
	
} 
