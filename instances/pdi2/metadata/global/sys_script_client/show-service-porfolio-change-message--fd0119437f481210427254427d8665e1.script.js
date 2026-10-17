function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === ''|| newValue === oldValue) {
        return;
    }
	g_form.showFieldMsg('spm_service_portfolio', nowapi.g_i18n.getMessage("By updating the service portfolio, this node and all its child nodes and/or services are moved to the new portfolio. If using DPM, the new service portfolio will inherit the new portfolio's KPI groups."), 'info');
}
