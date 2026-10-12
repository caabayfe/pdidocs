if (gs.getCurrentScopeName() != 'rhino.global') {
    gs.addErrorMessage(gs.getMessage('Please be in global application to update this property.'));
} else if (gs.getProperty("com.snc.availability.v2") == 'false') {
    gs.addErrorMessage(gs.getMessage('Please enable property com.snc.availability.v2 to update this property.'));
} else {
    var availability_global_tz = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_availability_global_tz"));
    var availability_commitment_tz = GlideStringUtil.normalizeWhitespace(g_request.getParameter("sysparm_availability_commitment_tz"));

    if (typeof availability_commitment_tz != "undefined" && gs.getProperty("spm.availability.commitment.tz") != availability_commitment_tz && GlideStringUtil.notNil(availability_commitment_tz)) {
        gs.setProperty("spm.availability.commitment.tz", SNC.GlideHTMLSanitizer.sanitize(availability_commitment_tz));
        gs.addInfoMessage(gs.getMessage('Availability calculation with commitment timezone set to {0}.', availability_commitment_tz));
    }
    if (typeof availability_global_tz != "undefined" && gs.getProperty("spm.availability.global.tz") != availability_global_tz && GlideStringUtil.notNil(availability_global_tz)) {
        gs.setProperty("spm.availability.global.tz", SNC.GlideHTMLSanitizer.sanitize(availability_global_tz));
        gs.addInfoMessage(gs.getMessage('Current availability timezone updated to {0}.', availability_global_tz));
    }
}

g_response.sendRedirect("$spm_availability_calculation_setting.do");
