(function execute(current) {
    var util = new global.ChangeTemplateMetrics(current);
    util.refreshMetrics();
    action.setRedirectURL(current);
})(current);
