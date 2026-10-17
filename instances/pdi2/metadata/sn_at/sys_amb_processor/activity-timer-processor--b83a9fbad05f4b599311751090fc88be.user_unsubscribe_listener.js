function /*void*/ onUnsubscribe(/*String*/ channel, /*String*/ user) {
	const params = channel.split('/').slice(2);
	const table = params[0];
	const sysId = params[1];

	const atUtils = new sn_at.ActivityTimerUtils();
	atUtils.stopTimer(table, sysId, user);
}
