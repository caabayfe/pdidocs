// If health_window,threshold_count,stability_count are invalid, set it to default values
if((current.health_window.nil()) || (current.health_window < 1)){
	current.health_window = '7';
}
if((current.threshold_count.nil()) || (current.threshold_count < 1)){
	current.threshold_count = '5';
}
if((current.stability_count.nil()) || (current.stability_count < 1)){
	current.stability_count = '1';
}
