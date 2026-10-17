function populateInactiveDomainData() {
    var ga = new GlideAjax('global.DeleteDomainUtilsAjax');
    ga.addParam('sysparm_name', 'populateInactiveDomainsStagedForDeletion');
    ga.getXMLAnswer(function(response) {
        if (response) {
            try {
                var g_form = new GlideForm();
                var result = JSON.parse(response);
                if (result.success) {
                    g_form.addInfoMessage(getMessage('Populate_Inactive_Domain_Data_Ajax_Result_Success'));
                } else {
                    g_form.addInfoMessage(getMessage('Populate_Inactive_Domain_Data_Ajax_Result_Failure'));
                }
            } catch (e) {
                g_form.addErrorMessage(getMessage('Populate_Inactive_Domain_Data_Ajax_Exception', e));
            }
        }
    });
}
