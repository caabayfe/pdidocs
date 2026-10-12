var SCModalUtil = Class.create();
SCModalUtil.prototype = {
    initialize: function() {},

    /**
     * set modal preference for the current user
     * toolName : sc tool name, like sc_monitoring_overview for monitoring overview page, sc_metrics for metrics summary page.
     * showModal : true to show the modal, otherwise false. 
     */
    setModalPreference: function(toolName, showModal) {
        if (!this._isValidUser()) {
            return;
        }

        var gr = this._getModalPreferenceRecord(toolName);
        if (!gr.next()) {
            gr.initialize();
            gr.setValue('user', gs.getUser().getID());
            gr.setValue('tool_name', toolName);
        }
        gr.setValue('show_modal', showModal);
        var currDate = new GlideDate();
        gr.setValue('tool_last_access', currDate);
        gr.setValue('modal_last_shown', currDate);
        gr.update();
    },

    /**
     * Updates the last access times of the preferences record and checks if the preference is out of date (default 90 days)
     *     Then, returns true or false if the modal should be displayed for the given toolName and current user
     * toolName : sc tool name, like sc_monitoring_overview for monitoring overview page, sc_metrics for metrics summary page.
     */
    getAndUpdateModalPreference: function(toolName) {
        if (!this._isValidUser()) {
            return false;
        }
        var gr = this._getModalPreferenceRecord(toolName);
        var show_modal = true;
        if (gr.next()) {
            show_modal = gr.show_modal == true;
            if (!show_modal && this._modalPreferenceIsOutdated(gr.getValue('tool_last_access'))) {
                gr.setValue('show_modal', true);
                show_modal = true;
            }
            var currDate = new GlideDate();
            if (show_modal) {
                gr.setValue('modal_last_shown', currDate);
            }
            gr.setValue('tool_last_access', currDate);
            gr.update();
        }
        return show_modal;
    },

    /**
     * Returns true if the preference is outdated (last access was greater than sn_vsc.first_time_modal_user_preference.hide.modal_duration days ago, default 90)
     * 
     * toolLastAccess : The last access date, to check if this is outdated
     */
    _modalPreferenceIsOutdated: function(toolLastAccess) {
        var lastAccessDate = new GlideDate();
        lastAccessDate.setValue(toolLastAccess);

        var hideModalDuration = gs.getProperty('sn_vsc.first_time_modal_user_preference.hide.modal_duration', 90);
        var outdatedDate = new GlideDate();
        outdatedDate.addDaysUTC(-hideModalDuration);
        return outdatedDate > lastAccessDate;
    },

    /**
     * Returns the sn_vsc_first_time_modal_user_preference record for the current user and the given toolName
     * 
     * toolName : sc tool name, like sc_monitoring_overview for monitoring overview page, sc_metrics for metrics summary 
     */
    _getModalPreferenceRecord: function(toolName) {
        var gr = new GlideRecordSecure('sn_vsc_first_time_modal_user_preference');
        gr.addQuery('tool_name', toolName);
        gr.addQuery('user', gs.getUser().getID());
        gr.setLimit(1);
        gr.query();
        return gr;
    },

    /**
     * Returns true if the current user has either admin or security center viewer role and exists in the database
     */
    _isValidUser: function() {
        return (gs.hasRole("sn_vsc.security_center_admin") || gs.hasRole('sn_vsc.security_center_viewer')) && new GlideRecord('sys_user').get(gs.getUser().getID());
    },

    type: 'SCModalUtil'
};
