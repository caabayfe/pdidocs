function transferDomainToStaging() {
    var ga = new GlideAjax('DeleteDomainUtilsAjax');
    ga.addParam('sysparm_name', 'ensureMaxDomainsToStaging');
    ga.getXMLAnswer(function(response) {
        if (response) {
            var g_form = new GlideForm();
            var parsedResponse = JSON.parse(response);
            if (parsedResponse.success == false) {
                g_form.addInfoMessage(getMessage('Transfer_Domain_To_Staging_Ajax_Result_Failure'));
            } else {
                var dialog = new GlideModal('transfer_domains_to_staging');
                dialog.setTitle(getMessage('Transfer_Domain_To_Staging_Ajax_Modal_Title'));
                dialog.render();
            }
        }
    });
}
