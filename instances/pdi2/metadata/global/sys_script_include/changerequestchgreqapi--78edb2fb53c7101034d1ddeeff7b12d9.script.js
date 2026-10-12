var ChangeRequestChgReqAPI = Class.create();
ChangeRequestChgReqAPI.prototype = Object.extendsObject(ChangeRequestChgReqAPISNC, {
    initialize: function(changeRequestGr) {
		ChangeRequestChgReqAPISNC.prototype.initialize.call(this, changeRequestGr);
    },

    type: 'ChangeRequestChgReqAPI'
});

ChangeRequestChgReqAPI.newNormal = ChangeRequestChgReqAPISNC.newNormal;
ChangeRequestChgReqAPI.newStandard = ChangeRequestChgReqAPISNC.newStandard;
ChangeRequestChgReqAPI.newEmergency = ChangeRequestChgReqAPISNC.newEmergency;
ChangeRequestChgReqAPI.newChange = ChangeRequestChgReqAPISNC.newChange;
