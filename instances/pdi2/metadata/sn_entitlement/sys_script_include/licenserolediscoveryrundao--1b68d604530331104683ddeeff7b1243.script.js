var LicenseRoleDiscoveryRunDao = Class.create();
LicenseRoleDiscoveryRunDao.prototype = {
    initialize: function() {
        this._DISCOVERY_TYPE_ALL = 0;
        this._DISCOVERY_TYPE_CUSTOM = 1;
        this._DISCOVERY_TYPE_OUT_OF_THE_BOX = 2;
    },

    /**
     * Creates a run record for an out of the box discovery run
     * 
     * @param {GlideDateTime} startTimeStamp The time the run started
     * @param {GlideDateTime} filterTimeStamp The filter timestamp used for the run
     * @returns {GUID} sys_id of the run record
     */
    createOutOfBoxRun: function(startTimeStamp, filterTimestamp) {
        return this._createRun(this._DISCOVERY_TYPE_OUT_OF_THE_BOX, startTimeStamp, filterTimestamp);
    },

    /**
     * Creates a run record for a custom discovery run
     * 
     * @param {GlideDateTime} startTimeStamp The time the run started
     * @param {GlideDateTime} filterTimeStamp The filter timestamp used for the run
     * @returns {GUID} sys_id of the run record
     */
    createCustomRun: function(startTimeStamp, filterTimestamp) {
        return this._createRun(this._DISCOVERY_TYPE_CUSTOM, startTimeStamp, filterTimestamp);
    },

    /**
     * Set the run end timestamp for the record
     * 
     * @param {GUID} id The sys_id of the run record
     * @param {GlideDateTime} endTimeStamp The endtime for the run
     * @returns {GUID} The sys_id of the updated record or null
     */
    setEndTimeStamp: function(id, endTimeStamp) {
        const gr = new GlideRecord('license_role_discovery_run');

        if (!gr.get(id))
            return null;

        gr.setValue('end_timestamp', endTimeStamp);
        return gr.update();
    },

    /**
     * Gets the most recent start timestamp for an out of the box run
     * 
     * @returns {GlideDateTime} the most recent start timestamp for an out of the box run
     */
    getStartTimestampByMostRecentOutOfBoxRun: function() {
        return this._getStartTimestampByDiscoveryTypeRun(this._DISCOVERY_TYPE_OUT_OF_THE_BOX);
    },

    /**
     * Gets the most recent start timestamp for a custom run
     * 
     * @returns {GlideDateTime} the most recent start timestamp for a custom run
     */
    getStartTimestampByMostRecentCustomRun: function() {
        return this._getStartTimestampByDiscoveryTypeRun(this._DISCOVERY_TYPE_CUSTOM);
    },

    _createRun: function(discoveryType, startTimeStamp, filterTimestamp) {
        const gr = new GlideRecord('license_role_discovery_run');
        gr.initialize();
        gr.setValue('start_timestamp', startTimeStamp);
        gr.setValue('filter_timestamp', filterTimestamp);
        gr.setValue('discovery_type', discoveryType);

        return gr.insert();
    },

    _getStartTimestampByDiscoveryTypeRun: function(discoveryType) {
        const ga = new GlideAggregate('license_role_discovery_run');
        ga.addAggregate('MAX', 'start_timestamp');
        ga.addQuery('discovery_type', discoveryType);
        ga.groupBy('discovery_type');
        ga.query();

        return ga.next() ? new GlideDateTime(ga.getAggregate('MAX', 'start_timestamp')) : null;
    },

    type: 'LicenseRoleDiscoveryRunDao'
};
