(function executeRule(current, previous /*null when async*/ ) {

    if (current.operation() == 'delete' || current.getValue('search_results_limit') !== previous.getValue('search_results_limit'))
        GlideCacheManager.flush('search_context_config_search_result_limit_cache');

})(current, previous);
