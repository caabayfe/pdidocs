(function executeRule(current, previous /*null when async*/) {
	if(current.key_alias !== 'code_signing_key')
		current.key_alias = 'code_signing_key';

})(current, previous);
