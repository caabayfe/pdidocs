//#region definitions
/**
 * @typedef {string} SysId
 *
 * @typedef {string} ClassType
 *
 * @typedef {string} ClassName
 *
 * @typedef {object} Node
 * @property {SysId} id
 * @property {string} name
 * @property {string} role
 * @property {string} className
 * @property {boolean} isManualConnection
 *
 * @typedef {object} Edge
 * @property {SysId} id
 * @property {SysId} parent
 * @property {SysId} child
 * @property {string} type
 * @property {SysId[]} pathIds
 * @property {boolean} isHidden
 * @property {boolean} isTrafficBased
 *
 * @typedef {object} MapGraph
 * @property {SysId} serviceId
 * @property {number} [serviceType]
 * @property {Record<SysId, Node>} nodes
 * @property {Record<SysId, Edge>} edges
 */
//#endregion

var ModellessServiceCoreUtils = Class.create();
ModellessServiceCoreUtils.prototype = {
    initialize: function() {
    },

    type: 'ModellessServiceCoreUtils'
};

ModellessServiceCoreUtils.CONSTANTS = {
    RELATION_TYPE_IDS: {
		HOSTED_ON: '5f985e0ec0a8010e00a9714f2a172815',
		IMPLEMENTS_EP: '45e94a74532221007c949096a11c0861',
		USE_EP: 'e7490a74532221007c949096a11c08b2',
		APP_FLOW: '85d98503ff100200d699ffffffffff8c',
		CLUSTER_OF: 'a99d39118f10310091769012cbbe4429',
    },
    DELETE_ENTRY_POINTS_BATCH_SIZE: 200,
};

/**
 * @param {SysId} bsId
 * @returns {string} JSON.stringify-ed MapGraph
 */
ModellessServiceCoreUtils.getMapGraph = function(bsId) {
    return SNC.BusinessServiceManager.getMapGraph(bsId);
};

/**
 * @param {ClassType} derived
 * @param {ClassType} base
 * @returns {boolean}
 */
ModellessServiceCoreUtils.isInstanceOf = function(derived, base) {
    return SNC.ClassModel.isInstanceOf(derived, base);
};

/**
 * @param {ClassName} ciClassName
 * @returns {ClassType}
 */
ModellessServiceCoreUtils.classifyCi = function(ciClassName) {
    return SNC.TopologyUtil.classifyCi(ciClassName);
};

/**
 * @param {SysId} bsId
 * @returns {boolean}
 */
ModellessServiceCoreUtils.isUnifiedService = function(bsId) {
    return SNC.UnifiedServiceUtils.isUnifiedService(bsId);
};

/**
 * @param {SysId} serviceId
 * @returns {boolean}
 */
ModellessServiceCoreUtils.isModelDisabled = function(serviceId) {
    return SNC.ServiceModelingUtils.initWithDefaultUtil().isModelDisabled(serviceId);
};

/**
 * @param {SysId} serviceId
 * @returns {boolean}
 */
ModellessServiceCoreUtils.isLightweight = function(serviceId) {
    return SNC.ServiceModelingUtils.initWithDefaultUtil().isLightweight(serviceId);
};

/**
 * @returns {boolean}
 */
ModellessServiceCoreUtils.isDomainSeparated = function() {
    return (new SNC.DomainHelper()).isDomainPluginInstalled();
};

/**
 * @returns {boolean}
 */
ModellessServiceCoreUtils.isLightweightFeatureSupported = function() {
    return typeof sn_sm_scoped_app !== 'undefined' &&
        'LightweightServiceManager' in sn_sm_scoped_app &&
        !ModellessServiceCoreUtils.isDomainSeparated();
};

/**
 * @returns {boolean}
 */
ModellessServiceCoreUtils.shouldNewServicesBeLightweight = function() {
    return GlideProperties.getBoolean('sn_app_service_ext.sm.lightweight.by_default', false) &&
        ModellessServiceCoreUtils.isLightweightFeatureSupported();
};

/**
 * @param {SysId} serviceId
 * @param {SysId[]} endpointSysIds
 */
ModellessServiceCoreUtils.deleteServiceEntryPoints = function(serviceId, endpointSysIds) {
    sn_sm_scoped_app.SMPGlobalApi.splitInChunks(endpointSysIds, ModellessServiceCoreUtils.CONSTANTS.DELETE_ENTRY_POINTS_BATCH_SIZE, function(batch) {
        var m2mGr = new GlideRecord('sa_m2m_service_entry_point');
        m2mGr.addQuery('cmdb_ci_service', serviceId);
        m2mGr.addQuery('cmdb_ci_endpoint', 'IN', batch);
        m2mGr.deleteMultiple();

        var endpointGr = new GlideRecord('cmdb_ci_endpoint_manual');
        endpointGr.addQuery('sys_id', 'IN', batch);
        endpointGr.deleteMultiple();
    });
};
