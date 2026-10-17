var AgentGlobalsHelper = Class.create();
/*
 * Sets global variables necessary for trigger condition checks in ADM
 *
 * Agentless Discovery sets the global variables used in discovery_classifier_probe.condition_script 
 * during classification. When patterns are triggered on Agents (ACC), these need to be set explictly in global scope 
 *
 **/
AgentGlobalsHelper.prototype = {
    initialize: function() {},

    setOSType: function(osType) {
        type = '' + osType;
        os_type = type.toUpperCase();
        gs.debug("In AgentGlobalsHelper: type =" + type + ", os_type =" + os_type);
    },

    setSensor: function(accSensor) {
        g_sensor = accSensor;
    },

    setSource: function(ipAddress) {
        source = ipAddress;
    },

    type: 'AgentGlobalsHelper'
};
