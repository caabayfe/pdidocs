(function executeRule(current, previous /*null when async*/ ) {
    if (current.parent.nil())
        current.consumer_type = 'internal';
	else if (current.parent.consumer_type != 'both')
        current.consumer_type = current.parent.consumer_type;
})(current, previous);
