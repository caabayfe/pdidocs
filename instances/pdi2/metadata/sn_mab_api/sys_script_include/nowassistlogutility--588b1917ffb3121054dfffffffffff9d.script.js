/**
 * This Utility class is intended to fetch and clean gen ai logs to be used elsewhere in the MAB API.
 */
class NowAssistLogUtility {
    constructor(logId) {
        this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
        this.logGr = this._getLog(logId);
        this.logId = logId;
    }

    /**
     * Fetches the log with a specific log sys id.
     * @param {String} logId - The sys_id of the log to search for.
     * @returns {GlideRecord} - The sys_generative_ai_log logs that match id
     */
    _getLog(logId) {
        const gr = new GlideRecord('sys_generative_ai_log');
        if (!gr.get(logId)) {
            this.customErrorHandler.throwNotFoundError(
                'LOG_NOT_FOUND_ERROR',
                `Failed to fetch log because the log record does not exist for the log id. logId: ${logId}.`
            );
        }
        return gr;
    }

    /**
     * Fetches the response of the model output. 
     * Reponse is in a conversation based formamt, but we only ever need the first response.
     * @returns {Object} - The response object from the log
     */
    getModelOutputResponseObject() {
        return JSON.parse(JSON.parse(this.logGr.getValue('response')).model_output);
    }

    getInputsFromPrompt() {
        const promptCollection = JSON.parse(this.logGr.getValue('prompt'));
        const prompt = promptCollection[0].content;
        
        const inputs = this._extractInputs(prompt);
        return inputs;
    }

    /**
     * Extracts the inputs from a prompt string.
     * Note: 
     * This is a specific string extraction dedicated for the MAIB Now Assist prompt formatting
     * This is not a general purpose string extraction function
     * @param {String} prompt - The prompt string to extract inputs from.
     * @returns {Array} - An array of objects containing the input name and value.
     * @example
     * prompt = "
     *    ---
     *    **Text Fields:**
     *    {{text_fields_to_map}}
     *    ---
     *    **Image Fields:**
     *    {{image_fields_to_map}}
     *    ---
     *    **Slots to Fill:**
     *    {{card_slot_descriptions}}
     *    ---
     * "
     * Returns [
     *    {name: "Text Fields", value: "{{text_fields_to_map}}"},
     *    {name: "Image Fields", value: "{{image_fields_to_map}}"},
     *    {name: "Slots to Fill", value: "{{card_slot_descriptions}}"}
     * ]
     */
    _extractInputs(prompt) {
        // Split the prompt into an array of inputs where each input should be between "**{input name}**" and "---"
        const parts = prompt.split('**');
        const inputs = [];
    
        // Iterate over the parts array, starting from index 1 to skip the first undefined split
        for (let i = 1; i < parts.length; i += 2) {
            if (parts[i + 1]) {
                const value = parts[i + 1].split('---')[0].trim();
                let name = parts[i].trim();
    
                if (name.endsWith(':')) {
                    name = name.slice(0, -1).trim();
                }
    
                inputs.push({
                    name: name,
                    value: value
                });
            }
        }
    
        return inputs;
    }

}

module.exports = NowAssistLogUtility;
