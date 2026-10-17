(function executeRule(current, previous /*null when async*/) {
    // Runs on insert AND update with filter input_type=voice. Fills defaults only for
    // numeric factors (Soft PIN, SMS OTP, TOTP) when the fields are empty. The empty-field
    // guard preserves any custom values an admin saved before read-only UI was in place
    // while still unblocking list-view text->voice updates.
    // SYNC: Default values must match in the two client scripts:
    //   - sys_script_client_af5fc1bebe5a4a308bcec7a5ce0182d5 (Voice defaults on input type change)
    //   - sys_script_client_77b98d58eebf4836abe150aea9db3524 (Voice defaults on factor change)

    // Numeric factor sys_ids — also referenced in the UI Policy and client scripts above
    var numericFactors = [
        '4dcf9a82b1803210f87728d1cb604284',  // Soft PIN
        '36bb5f5cff103210499dffffffffff8f',  // SMS OTP
        '8415e153ff143210bd55ffffffffff67',  // TOTP
        '00d80313ff000310a2ffffffffffff00'   // Email OTP
    ];

    if (numericFactors.indexOf(current.getValue('authentication_factor_id')) === -1)
        return;

    if (gs.nil(current.input_format_description)) {
        current.input_format_description = 'A 4-to-8 digit numeric code spoken for authentication. ' +
            'Digits may be individual (\u201cone two three four\u201d), grouped ' +
            '(\u201ctwelve thirty-four\u201d \u2192 1234), or mixed. ' +
            '\u201cOh,\u201d \u201cO,\u201d \u201cnaught,\u201d \u201cnil\u201d \u2192 0. \u201cNiner\u201d \u2192 9. ' +
            'Expand shorthand: \u201cdouble six\u201d \u2192 66, \u201ctriple eight\u201d \u2192 888, ' +
            '\u201cfour fives\u201d \u2192 5555. ' +
            'On self-correction (\u201cthree seven\u2014 sorry, eight two\u201d) discard ' +
            'the retracted digit, keep the corrected value. ' +
            'Ignore fillers (\u201cum,\u201d \u201cuh\u201d) and hesitation pauses. ' +
            'If ambiguous between repetition and emphasis, prefer literal ' +
            'interpretation and confirm. ' +
            'Preserve leading zeros. Output must be a digit-only string ' +
            'of length 4\u20138. If outside range return error.';
    }
    if (gs.nil(current.input_format_example)) {
        current.input_format_example = '1234, 243354, 33487376, 0032, 0320230, 12678642';
    }
    if (gs.nil(current.input_validation_pattern)) {
        current.input_validation_pattern = '^\\d{4,8}$';
    }

})(current, previous);
