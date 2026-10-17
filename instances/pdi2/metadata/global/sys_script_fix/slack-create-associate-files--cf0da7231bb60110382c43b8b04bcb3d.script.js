createAssociativeFiles();

function createAssociativeFiles() {
    gs.info('Running Fix script for creating slack bot records');
    var slackBotConfig = new SlackBotConfig();
    slackBotConfig.createRecords();
}
