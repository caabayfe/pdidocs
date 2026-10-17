function transform(input) {
    var errorMessages = "";

    //validating dataFilterId to avoid a roundtrip
    if (!input.dataFilterId) {
        errorMessages = gs.getMessage("No data filter selected to perform analysis");
        return {"errors": errorMessages};
    }

    // run performance analysis
    var perfAnalysis = new sn_sec_diag.DataFilterPerformanceAnalysis();
    var perfFilterStats = perfAnalysis.runPerfomanceAnalysis(input.dataFilterId, input.encodedQuery, input.numberOfQueryRuns);

    errorMessages = setErrorMessages(perfFilterStats.errors);
    if (errorMessages.length > 0)
        return {"errors": errorMessages};

    var perfFilterOffStats = {
        median: perfFilterStats["perfFilterOffStats.median"],
        mean: perfFilterStats["perfFilterOffStats.mean"],
        min: perfFilterStats["perfFilterOffStats.min"],
        max: perfFilterStats["perfFilterOffStats.max"]
    };
    var perfFilterOnStats = {
        median: perfFilterStats["perfFilterOnStats.median"],
        mean: perfFilterStats["perfFilterOnStats.mean"],
        min: perfFilterStats["perfFilterOnStats.min"],
        max: perfFilterStats["perfFilterOnStats.max"]
    };

    return {
        "perfFilterOffStats": perfFilterOffStats,
        "perfFilterOnStats": perfFilterOnStats,
        "medianPerfChangePct": perfFilterStats.medianPerfChangePct,
        "meanPerfChangePct": perfFilterStats.meanPerfChangePct,
        "filterId": input.dataFilterId,
        "errors": errorMessages
    };

    function setErrorMessages(errorArr) {
        var errorString = "";
        if (errorArr != null && errorArr !== 'undefined') {
            errorArr.forEach(function(message) {
                errorString += message + ".  ";
            });
        }

        return errorString;
    }
}
