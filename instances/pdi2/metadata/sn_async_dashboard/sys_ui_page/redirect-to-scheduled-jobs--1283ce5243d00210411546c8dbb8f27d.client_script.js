baseUrl = '/now/event_jobs/home/params/selected-tab/id%3Dscheduled_jobs';
var startTime = document.getElementById('start_time').innerHTML;
var endTime = document.getElementById('end_time').innerHTML;
window.location.href = baseUrl + '/rangestart/'+ startTime + '/rangeend/' + endTime;
