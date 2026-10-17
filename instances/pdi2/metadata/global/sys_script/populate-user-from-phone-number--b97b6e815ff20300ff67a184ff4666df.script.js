(function executeRule(current, previous /*null when async*/) {

	var nutil = new NotifyUtil();
	nutil.populateParticipantGRFromBeforeBR(current, previous);

})(current, previous);
