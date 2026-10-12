function onLoad() {
    var isCertificateBasedAuthEnabled = (g_scratchpad.isCertificateBasedAuthEnabled == 'true');
    var isCertificateBasedAuthFieldOnForm = g_form.hasField('enable_certificate_based_authentication');
    if (isCertificateBasedAuthEnabled && !isCertificateBasedAuthFieldOnForm)
        g_form.addInfoMessage(getMessage("Please add the field 'Enable certificate based authentication' using Form Layout to enable the feature. <a href='#' target='_blank'> More Details </a> "));
    else if (!isCertificateBasedAuthEnabled && isCertificateBasedAuthFieldOnForm)
        g_form.setVisible('enable_certificate_based_authentication', false);
}
