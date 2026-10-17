function transform(input) {
    
    var filterId = input.filterId;
    var phraseNumber = input.phraseNumber ? input.phraseNumber : 10;

    try {
        if (gs.nil(filterId)) {
            return [];
        }
        var result = sn_one_extend.OneExtendUtil.generateSamples(filterId, phraseNumber);
        var generatedAIPhrases = [];
        for (var i = 0; i < result.length; i++) {
            var phraseObject = {
                phrase: result[i],
                sysId: gs.generateGUID()
            };
            generatedAIPhrases.push(phraseObject);
        }

        return generatedAIPhrases;
    } catch (e) {
        gs.error("Failed fetch AI Generated phrases - " + e.toString());
        return [];
    }

}
