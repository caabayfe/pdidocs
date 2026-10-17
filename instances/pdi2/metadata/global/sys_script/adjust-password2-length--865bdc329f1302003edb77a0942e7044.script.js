(function executeRule(current, previous /*null when async*/) {

// length for password2 type should be at least 255 chars because we will be using storage encryption
if (current.max_length < 255)
	current.max_length = 255;

})(current, previous);
