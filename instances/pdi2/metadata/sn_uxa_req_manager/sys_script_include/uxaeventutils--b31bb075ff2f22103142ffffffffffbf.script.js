var UXAEventUtils = Class.create();
UXAEventUtils.prototype = {
    initialize: function() {},
    /**
     * Updates an event's display name and properties in the database
     * @param {string} appSysId - The application system ID
     * @param {string} name - The event ID/name to find the record
     * @param {string} displayName - The new display name to set
     * @param {object} properties - Object containing property updates
     * @returns {object} - Result object with success status and message
     */
    updateEventName: function(appSysId, name, displayName, properties, description) {
        try {
            // Create a GlideRecord for the event repository table
            var gr = new GlideRecord(UXAConstants.TABLE.EVENT_REPOSITORY);

            // Query for the specific event using event_id and application_id
            gr.addQuery(UXAConstants.EVENT_ID, name);
            gr.addQuery(UXAConstants.APP_ID, appSysId);
            gr.query();

            if (gr.next()) {
                // Update the display name if provided
                if (displayName) {
                    gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.DISPLAY_NAME, displayName);
                }

                // Update properties if provided
                if (properties && typeof properties === 'object') {
                    // Get existing properties as JSON
                    var existingProps = {};
                    if (gr.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.PROPERTIES)) {
                        existingProps = JSON.parse(gr.getValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.PROPERTIES));
                    }
                    for (var key in properties) {
                        if (properties.hasOwnProperty(key)) {
                            existingProps[key] = properties[key];
                        }
                    }
                    gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.PROPERTIES, JSON.stringify(existingProps));
                }
                if (description) {
                    gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.DESCRIPTION, description);
                }

                var success = gr.update();

                return {
                    status: 'success',
                    message: gs.getMessage('event updated successfully')
                };
            } else {
                // Create new record
                gr.initialize();
                gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.NAME, name);
                gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.DISPLAY_NAME, displayName);
                gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.APP_SYS_ID, appSysId);
                gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.DESCRIPTION, description);
				gr.setValue(UXAConstants.EVENT_REPOSITORY_TABLE_COLUMNS.EVENT_TYPE, 'default');
                gr.insert();
                return {
                    status: 'success',
                    message: gs.getMessage('event created successfully with name and displayName')
                };
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    },
    type: 'UXAEventUtils'
};
