var ChangeTemplateMetrics = Class.create();
ChangeTemplateMetrics.prototype = Object.extendsObject(ChangeTemplateMetricsSNC, {
    initialize: function(changeTemplateMetricGr, _gs) {
        ChangeTemplateMetricsSNC.prototype.initialize.call(this, changeTemplateMetricGr, _gs);
    },

    type: 'ChangeTemplateMetrics'
});
