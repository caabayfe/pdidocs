var DomainTransferToStagingAjax = Class.create();
DomainTransferToStagingAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    moveDomainsToStaging: function() {
        var response = {
            success: false,
            message: ''
        };
        // Retrieve the parameter from the GlideAjax request
        var retentionDays = parseInt(this.getParameter('sysparm_staging_retention_days'), 10);
        try {
            var transfer = new SNC.DomainCleanup();
            var result = transfer.transferToStaging(retentionDays);
            if (result) {
                response.success = true;
            } else {
                response.success = false;
            }
        } catch (e) {
            response.message = 'Error during domain transfer to staging for deletion: ' + e.message;
        }
        return new JSON().encode(response);
    }
});
