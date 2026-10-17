(function() {
	if (gs.getProperty('com.snc.sla.engine.version','2010') !== '2011')
		new global.SLABreakdownUtils().setBreakdownModulesVisible(false);
})();
