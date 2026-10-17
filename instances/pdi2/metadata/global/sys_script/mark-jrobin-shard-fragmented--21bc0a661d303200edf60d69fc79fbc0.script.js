(function executeRule(current, previous /*null when async*/) {
	gs.print("Pattern is removed.  Fragmented JRobin Shard: " + current.shard + " Position is now available: " + current.position);
	SNC.JRobinSharder.markFragmented(current.sys_class_name + "_count", current.shard, current.position);
 	SNC.JRobinSharder.markFragmented(current.sys_class_name + "_execution_time", current.shard, current.position);
})(current, previous);
