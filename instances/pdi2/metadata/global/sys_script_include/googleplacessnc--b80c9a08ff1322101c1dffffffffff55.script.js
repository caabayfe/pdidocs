/**
 * GooglePlacesSNC Class
 * Provides methods to interact with the Google Places API.
 * Requires a Connection & Credential record with an API key:
 *   1. Navigate to 'Connection & Credentials > Credentials'
 *   2. Open the record for 'Google Maps Platform'
 *   3. Set the value for 'API Key' by overwriting the placeholder dots
 *   4. Update the record
 * @class GooglePlacesSNC
 */
class GooglePlacesSNC {

    /**
     * Constructor
     */
    constructor() {
        this.className = 'GooglePlacesSNC';
        this.googlePlacesUrl = gs.getProperty('glide.ui.address.suggestions.api.host.url');
	this.apiKey = gs.getProperty('glide.ui.address.suggestions.api.host.apikey.encrpyted');
    }

    /**
     * Get address details for a given place ID
     * @param {*} id
     * @returns response object with address details
     */
    getDetails(id = '') {
        let response = {};
        try {
            id = String(id);
            if (id === '')
                throw 'empty id argument';

            const options = {
                fieldMask: 'formattedAddress,postalAddress'
            };
            const url = this.googlePlacesUrl + '/' + id;
            const responseObject = this._makeGooglePlacesRequest('get', url, options);
            if (responseObject.error)
                throw new Error(responseObject.content);

            response = JSON.parse(responseObject.content);
            response.errorCode = 0;
        } catch (e) {
            gs.logError('CAUGHT: getDetails: ' + e.message, this.className);
            return {
                'error': e.message
            };
        }
        return response;
    }

    /**
     * Get address suggestions for a given input
     * @param {*} input
     * @returns array of address suggestions
     */
    getSuggestions(input = '') {
        const results = [];
        try {
            input = String(input);
            if (input === '')
                throw new Error('empty input argument');

            const options = {
                body: {
                    input: input,
                    languageCode: 'en',
                    includedRegionCodes: ['us']
                },
                fieldMask: 'suggestions.placePrediction.text.text,suggestions.placePrediction.placeId'
            };
            const url = this.googlePlacesUrl + ':autocomplete';
            const responseObject = this._makeGooglePlacesRequest('post', url, options);
            if (responseObject.error)
                throw new Error('API request error: ' + responseObject.content);

            const response = JSON.parse(responseObject.content);
            response.suggestions.forEach(function(p) {
                results.push({
                    id: p.placePrediction.placeId,
                    label: p.placePrediction.text.text,
                    className: this.className,
                });
            }, this);
        } catch (e) {
            gs.logError('CAUGHT: getSuggestions: ' + e.message, this.className);
        }
        return results;
    }

    /**
     * Make a request to the Google Places API
     * @param {*} method
     * @param {*} endpoint
     * @param {*} options
     * @returns
     */
    _makeGooglePlacesRequest(method, endpoint, options) {
        const resultObject = {
            error: false,
            content: ''
        };
        try {
            if (this.apiKey === '')
                throw new Error('empty API key');

            const request = new sn_ws.RESTMessageV2();
            request.setHttpMethod(method);
            request.setEndpoint(endpoint);
            request.setRequestHeader('X-Goog-Api-Key', this.apiKey);
            if (options.body)
                request.setRequestBody(JSON.stringify(options.body));
            if (options.fieldMask)
                request.setRequestHeader('X-Goog-FieldMask', options.fieldMask);
            const response = request.execute();
            if (response.haveError())
                throw new Error(response.getErrorCode() + ': ' + response.getErrorMessage());

            resultObject.content = response.getBody();
        } catch (e) {
            resultObject.error = true;
            resultObject.content = e.message;
        }
        return resultObject;
    }
}
