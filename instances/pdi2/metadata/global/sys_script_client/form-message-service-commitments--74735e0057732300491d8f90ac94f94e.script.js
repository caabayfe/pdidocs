function onLoad() {
	if (g_form.isNewRecord())
		return;

    if (!g_scratchpad || !g_scratchpad.sla_metadata)
        return;

	if (g_scratchpad.sla_metadata.is_service_commitment !== true)
		return;
	
	if (g_scratchpad.sla_metadata.has_commitments !== true) {
		if (g_scratchpad.sla_metadata.is_legacy_service_commitment) {
			g_form.addInfoMessage(getMessage("This is a Service Offering SLA but has not been associated to a Service Commitment record"));
			addPermanentMessage(getMessage("This is a Service Offering SLA but has not been associated to a Service Commitment record"));
		} else {
			g_form.addInfoMessage(getMessage("SLA Definition has been defined as a Service Commitment but has not been associated to a Service Commitment record"));
			addPermanentMessage(getMessage("SLA Definition has been defined as a Service Commitment but has not been associated to a Service Commitment record"));
		}
	}
}
