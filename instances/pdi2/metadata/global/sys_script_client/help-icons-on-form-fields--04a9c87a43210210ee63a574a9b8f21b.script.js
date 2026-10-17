function onLoad() {
   g_form.addDecoration('automatic_processing', 'icon-help', 
   		'When selected, the queue will be switched to automatic job scheduling and the system will handle all the job configurations.');
   g_form.addDecoration('processing_order', 'icon-help', 
   		"Selecting 'Parallel' allows processing events with multiple jobs, whereas 'Sequential' restricts events to be processed with one job.");
   g_form.addDecoration('job_config', 'icon-help', 
   		"Selecting 'Scale with node' will multiply jobs by the number of nodes, while 'Constant number' will attempt to create that many jobs.");
   g_form.addDecoration('job_config_value', 'icon-help', 
   		"The total number of jobs will be calculated based on the job configuration type selected.");
   g_form.addDecoration('poll_interval', 'icon-help', 
   		"Determines how frequently events should be polled for processing from this queue.");
   
}
