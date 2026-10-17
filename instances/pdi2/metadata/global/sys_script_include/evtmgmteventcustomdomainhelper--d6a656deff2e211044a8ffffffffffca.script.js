var EvtMgmtEventCustomDomainHelper = Class.create();
EvtMgmtEventCustomDomainHelper.prototype = {
    initialize: function() {},

	/**
	 * @param {*} connectorDomainInfoTableName - Table name where domain metadata is stored
     * @param {*} connectorDomainInfoColumnName - Column name to find a matching domain record
     * @param {*} payloadDomainInfoFieldValue - Resolved value from event payload to find a matching domain record
     * @param {*} connectorDomainIdColumnName - Domain ID column name (sys_domain)
     * @param {*} connectorDomainPathColumnName - Domain Path column name (sys_domain_path)
     * @return {*} Cached domain separation model JSON string.
	 */
	getCustomDomainSepModel: function(domainInfoTableName, domainInfoColumnName, domainRecordFieldValueToMatch, domainIdColumnName, domainPathColumnName) {
		return new SNC.EventCustomDomainHelper().getCustomDomainSepModel(domainInfoTableName, domainInfoColumnName, domainRecordFieldValueToMatch, domainIdColumnName, domainPathColumnName);
	},

	/**
	 * Checks if current session user has access to specified user ID
   * @return {*} Boolean - true if user has access, false otherwise
	 */
	userHasDomainAccess: function(domainId) {
		return new SNC.EventCustomDomainHelper().userHasDomainAccess(domainId);
	},

	/**
	 * @param {*} msgKey - Event message key
	 * @param {*} cause - Cause of error
	 * @param {*} remediation - Proposed remediation steps to follow
	 * @param {*} healthEventSource - Source of health event
	 * @param {*} additionalInfoJsonStr - Additional information to be added in additional_info field of event (json string)
	 */
	sendSelfMonitoringEvent: function(msgKey, cause, remediation, healthEventSource, additionalInfoJsonStr) {
		return new SNC.EventCustomDomainHelper().sendSelfMonitoringEvent(msgKey, cause, remediation, healthEventSource, additionalInfoJsonStr);
	},

    type: 'EvtMgmtEventCustomDomainHelper'
};
