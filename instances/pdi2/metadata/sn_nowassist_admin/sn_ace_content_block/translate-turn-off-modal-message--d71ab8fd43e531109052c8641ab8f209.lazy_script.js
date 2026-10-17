(function(context, pageParams, blockcontext) {
    // return some_output
    var CONVERSATIONAL_EXPERIENCE_SKILL_ID = 'f98eb0e9775131101b53c5ed3c5a99aa';

    var skillName = blockcontext.turnOffModalMessage;
    var turnOffModalMessage = gs.getMessage("Deactivate {0}? This will deactivate the skill for your users.", skillName);
    var translatedText = "<p style='margin:0px;font-size:16px;'>" + turnOffModalMessage + "</p>";
    if (pageParams.featureId === CONVERSATIONAL_EXPERIENCE_SKILL_ID) {
        turnOffModalMessage = gs.getMessage("Deactivating the {0} skill will impact experiences to the following Channels and applications:", skillName);
        translatedText = "<p style='margin:0px;font-size:16px;'>" + turnOffModalMessage + "<ul><li>Portal One</li><li>Global Search</li><li>Now Assist in VA</li></ul>" + "</p>";
    }

    return {
        translatedText: translatedText
    };
})(context, pageParams, blockcontext);
