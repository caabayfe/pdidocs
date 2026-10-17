function openResetSyntheticValueConfirmationModal() {
    var modal = new GlideModal("modal_reset_synthetic_value_confirmation", false, "modal-md");
    modal.setTitle(new GwtMessage().getMessage("Reset synthetic values to default?"));
    modal.render();
}

function restrictSyntheticValueReset() {
    var ga = new GlideAjax('DataDiscoveryCommonsUtilCore');
    ga.addParam('sysparm_name', 'isDiscoveryFeatureSupportedForRelease');
    ga.getXMLAnswer(function(response) {
        if (response === 'false') {
            g_form.addInfoMessage(new GwtMessage().getMessage("Upgrade to the <a href='https://www.servicenow.com/docs/csh?topicname=data-discovery-landing.html&version=latest' target='_blank'> Yokohama platform </a> version to use synthetic data features."));
            return;
        }
        openResetSyntheticValueConfirmationModal();
    });
}
