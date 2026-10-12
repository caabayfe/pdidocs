(function executeRule(current, previous /*null when async*/ ) {

    var solutionName = current.getValue("solution_name");

    if (solutionName.includes(PDFtoTableConstants.PARSER_CONFIGURATION_RECORD_LABEL)) {
        var pdfHelper = new PDFtoTableHelper();
        pdfHelper.getPdfResult(current);
    }
})(current, previous);
