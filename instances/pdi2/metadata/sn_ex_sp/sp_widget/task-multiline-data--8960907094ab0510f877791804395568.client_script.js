api.controller = function($scope, $sce, $sanitize) {
    var c = this;
    c.data.childData.forEach(function(record) {
        record.forEach(function(field) {
            if (field.fieldType === 'translated_html' || field.fieldType === 'html') {
                field.htmlValue = $sce.trustAsHtml($sanitize(field.value));
            }
        });
    });
    c.fieldClass = "col-xs-12 col-sm-6 col-md-6 col-lg-4";

    if ($('.task-configuration-info').width() > 800) {
        c.fieldClass = "col-xs-12 col-sm-6 col-md-4 col-lg-3";
    }
};
