api.controller = function($sce, $sanitize, $timeout) {
    /* widget controller */
    var c = this;
    if (this.data.commonLinkField && (this.data.commonLinkField.fieldType === 'translated_html' || this.data.commonLinkField.fieldType === 'html')) {
        this.data.commonLinkField.htmlValue = $sce.trustAsHtml($sanitize(this.data.commonLinkField.value));
    }
    if (this.data.commonStaticFields) {
        this.data.commonStaticFields.forEach(function(field) {
            if (field.fieldType === 'translated_html' || field.fieldType === 'html') {
                field.htmlValue = $sce.trustAsHtml($sanitize(field.value));
            }
        });
    }
    if (c.data.external) {
        $timeout(function() {
            $('#' + c.data.taskSysId + '_todo_link').attr('target', '_blank');
        });
    }
};
