baseUrl = '/now/event_jobs/home/params/queue/DEFAULT/selected-tab/id%3Dsystem_event_monitoring';
var startTime = document.getElementById('start_time').innerHTML;
var endTime = document.getElementById('end_time').innerHTML;
window.location.href = baseUrl + '/start/'+ startTime + '/end/' + endTime;
