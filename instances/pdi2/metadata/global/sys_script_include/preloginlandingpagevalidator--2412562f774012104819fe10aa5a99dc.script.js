const domainPatternRegex = /^https:\/\/(?!\d{1,3}(\.\d{1,3}){3})(?!\[)(?!.*@)([a-z0-9-]{2,}\.)*([a-z0-9-]{2,})+\.[a-z]{2,}/i;
class ValidationResult {
    constructor(isValid, message) {
        this.isValid = isValid;
        this.message = message;
    }
}
var PreLoginLandingPageValidator = Class.create();

PreLoginLandingPageValidator.prototype = {
    initialize: function(value) {
        this.value = value;
    },
    validate: function() {
        let response = this._validatePropertyValue(this.value);
        if (!response.isValid)
            return response;

        let url = response.url;
        if (!(this._validateUrlPattern(url).isValid))
            return this._getRegExValidationMessage(url);

        return this._checkForServicenowDomain(url);
    },
    _validatePropertyValue: function(value) {
        try {
            var validationResult = JSON.parse(value);
        } catch (e) {
            return new ValidationResult(false, 'typeof preLoginLandingPage should be JSON');
        }

        if (typeof validationResult !== 'object')
            return new ValidationResult(false, 'preLoginLandingPage value should a valid JSON format');

        let url = String(validationResult['url']);
        if (url.trim().length === 0 || url === undefined || !('url' in validationResult))
            return new ValidationResult(false, 'url attribute is mandatory for preLoginLandingPage');

        if (url.length > 2000)
            return new ValidationResult(false, "Please note that the maximum length for this field is approximately 2000 characters. Please edit your input accordingly to ensure it does not exceed the limit.");

        return {
            'isValid': true,
            'url': url
        };
    },

    _validateUrlPattern: function(url) {
        const regexForUrlPattern = /^https:\/\/(?!\d{1,3}(\.\d{1,3}){3})(?!\[)(?!.*@)([a-z0-9-]{2,}\.)*([a-z0-9-]{2,})+\.[a-z]{2,}(:\d{1,5})?(\/.*)?$/i;
        return this._urlValidation(url, regexForUrlPattern, '');
    },

    _getRegExValidationMessage: function(url) {
        //validation for https protocol
        var response = this._validateHttpPattern(url);
        if (!response.isValid)
            return response;

        //validation that url does not include IPv4 or IPv6
        response = this._validateIPPattern(url);
        if (!response.isValid)
            return response;

        //validation that url does not include user info password
        response = this._validateUserInfoPattern(url);
        if (!response.isValid)
            return response;

        //validation for domain and subdomain
        response = this._validateDomainPattern(url);
        if (!response.isValid)
            return response;

        return new ValidationResult(false, 'Please check that url has proper value');
    },

    _validateHttpPattern: function(url) {
        const regexForHttpPattern = /^https:\/\//i;
        const message = "Always ensure you have a secure connection, which is indicated by 'https://' at the beginning of the URL. This is vital for your data's safety. Without it, we cannot ensure the data confidentiality, integrity and service authentication.";

        return this._urlValidation(url, regexForHttpPattern, message);
    },
    _validateIPPattern: function(url) {
        const regexForIPPattern = /^https:\/\/(?!\d{1,3}(\.\d{1,3}){3})(?!\[)/i;
        const message = "Ensure your host value does not include IPv4 or IPv6, even within RFC limits. This is crucial for validating service identity in the TLS handshake. Your vigilance prevents security issues.";

        return this._urlValidation(url, regexForIPPattern, message);
    },

    _validateUserInfoPattern: function(url) {
        const regexForUserInfoPattern = /^https:\/\/(?!\d{1,3}(\.\d{1,3}){3})(?!\[)(?!.*@)/i;
        const message = "Please ensure the URL is correctly formatted and does not include sensitive information.";

        return this._urlValidation(url, regexForUserInfoPattern, message);
    },

    _validateDomainPattern: function(url) {
        const message = "The domain or subdomain in the URL is not correctly formatted. Please verify and correct the syntax";

        return this._urlValidation(url, domainPatternRegex, message);
    },

    _urlValidation: function(urlValue, regex, message) {
        var regexObj = new RegExp(regex);
        if (!(regexObj.test(urlValue)))
            return new ValidationResult(false, message);

        return new ValidationResult(true);
    },

    _checkForServicenowDomain: function(urlValue) {
        const domain = urlValue.match(domainPatternRegex);
        const hostname = domain[0].replace(/^https?:\/\//, '').split('/')[0];
        const validHostnamePattern = /^(?:[a-zA-Z0-9-]+\.)*(servicenow\.com|service-now\.com)$/;
        if (!validHostnamePattern.test(hostname) || (hostname.match(/servicenow/g) || []).length > 1 || (hostname.match(/service-now/g) || []).length > 1)
            return new ValidationResult(true, "Please be aware that loading content from a website outside of the ServiceNow zone of trust carries security risks. By proceeding with the current setting, you accept the risk.");

        return new ValidationResult(true, "Ensure the URL is correct and secure. An incorrect or malicious URL can cause service disruption or security risks.");
    },

    type: 'PreLoginLandingPageValidator'
};
