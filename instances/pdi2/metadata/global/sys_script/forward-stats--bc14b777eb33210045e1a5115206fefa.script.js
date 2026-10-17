var streamId = "evt.mgmt.stats";
var column_list = ['start_time', 'elapsed_time', 'number_of_events', 'avg_processing_time',
				  'max_processing_time', 'avg_insertion_time', 'max_insertion_time'];

status = AnalyticsFramework.send(streamId, current, column_list);
