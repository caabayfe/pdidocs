// Get alert count
var alertGr = new GlideAggregate('em_alert');
alertGr.addAggregate('COUNT');
alertGr.query();
var alertCount = 0;
if(alertGr.next()){
    alertCount = alertGr.getAggregate('COUNT');
}

// Get event count
var eventGr = new GlideAggregate('em_event');
eventGr.addAggregate('COUNT');
eventGr.query();
var eventCount = 0;
if(eventGr.next()){
    eventCount = eventGr.getAggregate('COUNT');
}

// Get event rotation table info and determine number of days in rotation
var rotationGr = new GlideRecord('sys_table_rotation');
rotationGr.addQuery('name', 'em_event');
rotationGr.query();

var days = 6; // reducing 1 from duration since rotation optimizes ~1 day.
if (rotationGr.next()){
    var rotations = rotationGr.getValue('rotations');
    var duration = new GlideDateTime(rotationGr.getValue('duration'));
    var durationDays = duration.getNumericValue()/86400000;
    
    // reducing 1 from duration since rotation optimizes ~1 day.
    var rotationDays = rotations*durationDays-1*durationDays;
    if (rotationDays >= 1)
        days = rotationDays;
}

// Get alert table retention time (default 90)
var cleanerGr = new GlideRecord('sys_auto_flush');
cleanerGr.addQuery('tablename', 'em_alert');
cleanerGr.query();
var cleanerDays = 90;
if (cleanerGr.next()){
    var age = cleanerGr.getValue('age')/86400;
    if (age >= 1)
        cleanerDays = age;
}

var eventsPerDay = Math.round(eventCount/days);
var alertsPerDay = Math.round(alertCount/cleanerDays);

var result = 0;
if (eventsPerDay > 0){
    if (alertsPerDay == 0){
        result = 100;
    } else {
        result = 100-(Math.round(alertsPerDay/eventsPerDay*100));
    }
}
answer = result;
