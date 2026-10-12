(function process(payload) {
    // implement validation here
    /* return {
    	is_valid: true/false,
    	error_message: 'Missing required field XYZ'
    	} */
    return new DeploymentRequestPayloadValidator().validate(payload);
})(payload);
