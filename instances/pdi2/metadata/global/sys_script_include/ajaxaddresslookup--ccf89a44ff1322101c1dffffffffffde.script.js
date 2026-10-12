/*
	GooglePlacesSNC can be replaced with a custom class. The custom class needs three methods:
		1. getSuggestions(input)
		2. getDetails(id)
		3. getClassName()
	See the method comments in GooglePlacesSNC for details on required arguments and return types
*/

/**
 * AJAXAddressLookup class
 * Enables client-side address field to use an address lookup service
 * Extends AbstractAjaxProcessor
 * @class AJAXAddressLookup
 */
class AJAXAddressLookup extends AbstractAjaxProcessor {

    /**
     * Constructor calls the parent constructor and initializes the lookup object
     * @constructor
     */
    constructor() {
        super(...arguments);
        this.className = 'AJAXAddressLookup';
        this.lookup = new global.GooglePlacesSNC(); // Can be replaced with a custom class
    }

    /**
     * CORE UI: Get address details for a given place ID
     * @returns {string} JSON string with address details
     */
    getDetails() {
        const id = String(this.getParameter('sysparm_id') || '');
		if (id === '')
			return "{}";

        const details = this.lookup.getDetails(id);
        return JSON.stringify({
            formattedAddress: details.formattedAddress
        });
    }

    /**
     * CORE UI: Get address suggestions for a given input
     * @returns {XMLDocument} XML document with suggestion items
     */
    getSuggestions() {
        const chars = String(this.getChars() || '');
		if (chars === '')
			return this.getRootElement();

        const suggestions = this.lookup.getSuggestions(chars);
        return this._transformSuggestionsCoreUI(chars, suggestions);
    }

    /**
     * CORE UI: Transform suggestions from API into XML items for Core UI
     * @param {*} input
     * @param {*} suggestions
     * @returns {XMLDocument} XML document with suggestion items
     */
    _transformSuggestionsCoreUI(input, suggestions) {
        const result = this.getRootElement();
        try {
            // Get parameters
            const timer = this.getParameter('sysparm_timer');
            const field = this.getParameter('sysparm_field');

            // Iterate over suggestions and create XML items
            suggestions.forEach(function(suggestion) {
                const id = suggestion.id;
                const label = suggestion.label;
                const className = suggestion.className;

                const itemNode = this.newItem('item');
                itemNode.setAttribute('label', label);
                itemNode.setAttribute('name', id);
                itemNode.setAttribute('sys_class_name', className);

                const fieldNode = this.newItem('field');
                fieldNode.setAttribute('name', 'description');
                fieldNode.setAttribute('value', label);
                itemNode.appendChild(fieldNode);

                result.appendChild(itemNode);
            }, this);
            result.setAttribute('sysparm_name', field);
            result.setAttribute('sysparm_chars', input);
            result.setAttribute('sysparm_type', this.className);
            result.setAttribute('sysparm_timer', timer);
        } catch (e) {
            gs.logError('_transformSuggestions: ' + e.message, this.className);
        }
        return result;
    }

    /**
     * WORKSPACE UI: ?
     */
    getSuggestionsWorkspace() {
        const chars = String(this.getChars() || '');
        const suggestions = this.lookup.getSuggestions(chars);
        return this._transformSuggestionsForWorkspaceUI(chars, suggestions);
    }

    /**
     * WORKSPACE UI: 
     */
    getDetailsWorkspace() {
        const id = String(this.getParameter('sysparm_id') || '');
        const details = this.lookup.getDetails(id);
        return JSON.stringify({
            value: details.formattedAddress
        });
    }

    /**
     * WORKSPACE UI: ?
     */
    _transformSuggestionsForWorkspaceUI(input, suggestions) {
        const results = [];
        suggestions.forEach(function(suggestion) {
            const id = suggestion.id;
            const label = suggestion.label;
            results.push({
                id: id,
                label: label
            });
        });
        return JSON.stringify({
			suggestions: results
		});
    }
}
