var referenceProfile = event.parm1;
var targetProfile = event.parm2;
var util = new SuggestedUtteranceUtil();
gs.info("Calling SuggestedUtteranceUtil to initiate seeding suggested utterances with reference profile: " + referenceProfile + " and target profile: " + targetProfile);
var start = new Date();
util.seedSuggestedUtterances(referenceProfile, targetProfile);
var timeTakenMs = new Date() - start;
gs.info("Finished job to generate suggested utterances for profile " + targetProfile + " in " + timeTakenMs + "ms.")
