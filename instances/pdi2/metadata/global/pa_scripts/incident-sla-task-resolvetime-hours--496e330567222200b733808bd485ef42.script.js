var hours = function(duration) {return (duration.getNumericValue()/(1000 * 60 * 60));};

var businessDuration = new GlideDuration();
businessDuration.setValue(current.taskslatable_business_duration);
hours(businessDuration);
