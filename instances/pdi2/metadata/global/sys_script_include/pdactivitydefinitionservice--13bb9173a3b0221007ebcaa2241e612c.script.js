var PDActivityDefinitionService = Class.create();
PDActivityDefinitionService.prototype = {
    initialize: function() {
        this.repository = new PDActivityDefinitionRepository();
    },
    type: 'PDActivityDefinitionService',
    getActivityDefinitions: function() {
        return this.repository.getActivityDefinitions();
    },
};
