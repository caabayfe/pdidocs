(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var returnObj = {};
    var sysProp = gs.getProperty('sn_va_slack.enable_slack_branding', 'false');
    var botConfig = new SlackBotConfig().getSlackBots();
    returnObj['botConfig'] = botConfig;
    returnObj['propValue'] = sysProp;
    return returnObj;

})(request, response);
