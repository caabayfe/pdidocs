var configCheckerConfig = new sn_appauthor.ScheduledJobsController().getConfig("configChecker");
if(configCheckerConfig.isEnabled) {
  var dt = new GlideDateTime();
  var rand = getRandomIntInclusive(configCheckerConfig.startTime, configCheckerConfig.endTime);
  dt.addSeconds(rand);

  gs.info("Process in " + rand + " minutes");
  gs.eventQueueScheduled("sn_appauthor.check.config.update","","","", dt);
}
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
