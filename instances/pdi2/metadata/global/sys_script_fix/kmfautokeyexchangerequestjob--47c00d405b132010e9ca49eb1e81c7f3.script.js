var result = new SNC.KMFAutoKeyExchangeRequestGeneratorAPI().createAutoKeyExchangeRequestJob();
var parsedResult = JSON.parse(result);
if (parsedResult.success === "true")
    gs.log(gs.getMessage('Succesfully created automatic key exchange requests job'));
else
    gs.log(gs.getMessage('Could not generate automatic key exchange requests job because of {0}', parsedResult.message));
