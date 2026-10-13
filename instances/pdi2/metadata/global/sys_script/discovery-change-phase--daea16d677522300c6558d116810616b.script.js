checkNextPhase();

function checkNextPhase() {
	var dp = new DiscoveryPhaser(current);
	if (dp.hasNextPhase()) {
		var sl = new ShazzamLaunch(dp.status, dp.schedule);
		sl.launch();
	}
}
