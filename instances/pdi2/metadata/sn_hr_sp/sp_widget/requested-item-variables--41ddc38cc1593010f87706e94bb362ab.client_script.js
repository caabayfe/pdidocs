function reqItemVarController($scope, snAttachmentHandler, spModal) {
    var c = this;
    $scope.scanAttachment = function(variable) {
        if (variable.state == 'not_available')
            snAttachmentHandler.showMessage('error', i18n.getMessage('Upload file scan failed').withValues([variable.display_value]));
        else
            snAttachmentHandler.scanAttachment({
                'sys_id': variable.value
            });
    };
    /* Open mrvs data in a model for mobile screen */
    c.openMrvsModal = function(data) {
        spModal.open({
            title: data.label,
            widget: "template_renderer",
            widgetInput: {
                data: data,
                template: "sp_multirow_vs_summarizer.html"
            },
            buttons: [{
                label: c.data.labelClose,
                primary: true
            }]
        });
    };
}
