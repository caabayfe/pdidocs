var updateCheckerConfig = new sn_appauthor.ScheduledJobsController().getConfig("updateChecker");
if(updateCheckerConfig.isEnabled) {
var dt = new GlideDateTime();
var rand = getRandomIntInclusive(updateCheckerConfig.startTime, updateCheckerConfig.endTime);
dt.addSeconds(rand);

gs.info("Process in " + rand + " seconds");
gs.eventQueueScheduled("sn_appclient.check.for.update","","","", dt);
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
