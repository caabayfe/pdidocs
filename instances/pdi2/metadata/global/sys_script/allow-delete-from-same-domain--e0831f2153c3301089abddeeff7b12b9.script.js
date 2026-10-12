(function executeRule(current, previous /*null when async*/) {
	new SNHelpDomainUtil().restrictDeleteToSameDomain(current);
})(current, previous);
