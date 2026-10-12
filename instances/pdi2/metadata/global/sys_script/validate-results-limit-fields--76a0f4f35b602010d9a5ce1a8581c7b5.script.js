(function executeRule(current, previous /*null when async*/ ) {
    var cancelTransaction = false;
    if (current.getValue('genius_results_limit') < 0) {
        gs.addErrorMessage(gs.getMessage('Genius Results Limit cannot be a negative number'));
        cancelTransaction = true;
    } else if (current.getValue('genius_results_limit') > 10) {
        gs.addErrorMessage(gs.getMessage('Genius Results Limit cannot be more than 10'));
        cancelTransaction = true;
    }
    if (current.getValue('search_results_limit') < 0) {
        gs.addErrorMessage(gs.getMessage('Search Results Limit cannot be a negative number'));
        cancelTransaction = true;
    }
    var max = parseInt(gs.getProperty('glide.search.max_search_results'));
    if (max != null && current.getValue('search_results_limit') > max) {
        gs.addErrorMessage(gs.getMessage('Search Results Limit cannot be more than {0}', [max.toString()]));
        cancelTransaction = true;
    }
    if (current.getValue('search_engine') === 'zing' && current.getValue('suggestions_to_show_limit') < 0) {
        gs.addErrorMessage(gs.getMessage('Suggestions Limit cannot be a negative number'));
        cancelTransaction = true;
    }

    if (cancelTransaction) {
        current.setAbortAction(true);
    }
})(current, previous);
