(function executeRule(current, previous /*null when async*/ ) {

    // Clear fields based on the new attribute type
    switch (current.type.toString()) {
        case 'static':
            current.security_attribute = '';
            current.expression = '';
            break;

        case 'security_attribute':
            current.expression = '';
            current.value = '';
            break;

        case 'pattern':
            current.security_attribute = '';
            current.value = '';
            break;

        case 'free':
            current.security_attribute = '';
            current.value = '';
            current.expression = '';
            break;

            // No default case needed as we only want to handle these specific types
    }

})(current, previous);
