(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    gs.setProperty('show_probe_to_patterns_migration_banner', false);
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);
