(function executeRule(current, previous /*null when async*/ ) {
    if (gs.nil(current.getValue("vector_dimension"))) {
        gs.addErrorMessage(gs.getMessage("Vector dimension is mandatory for embedding model"));
        current.setAbortAction(true);
    }

    if (gs.nil(current.getValue("max_tokens"))) {
        gs.addErrorMessage(gs.getMessage("Max Tokens is mandatory for embedding model"));
        current.setAbortAction(true);
    }

    if (parseInt(current.getValue("vector_dimension")) > 4096) {
        gs.addErrorMessage(gs.getMessage("Vector dimension should be less than or equal to 4096."));
        current.setAbortAction(true);
    }

})(current, previous);
