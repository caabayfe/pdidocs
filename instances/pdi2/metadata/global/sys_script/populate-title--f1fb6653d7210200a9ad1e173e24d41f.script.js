(function executeRule(current, previous /*undefined when async or display*/) {

	current.title = current.sp_widget.name;

})(current, typeof previous != 'undefined' ?  previous : null);
