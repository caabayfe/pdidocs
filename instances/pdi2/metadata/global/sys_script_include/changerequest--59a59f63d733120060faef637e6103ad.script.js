var ChangeRequest = Class.create();
ChangeRequest.CHANGE_REQUEST = "change_request";

// These constants are used for support of classic 'Mode 1' change types
ChangeRequest.NORMAL = ChangeRequestSNC.NORMAL;
ChangeRequest.STANDARD = ChangeRequestSNC.STANDARD;
ChangeRequest.EMERGENCY = ChangeRequestSNC.EMERGENCY;

// These states are only used to provide the set*, is*, to*, changesTo/From* legacy methods
ChangeRequest.LEGACY_STATE = ChangeRequestSNC.LEGACY_STATE;

ChangeRequest.prototype = Object.extendsObject(ChangeRequestSNC, {
	initialize: function(changeGr) {
		ChangeRequestSNC.prototype.initialize.call(this, changeGr);
	},
	
    type: "ChangeRequest"
});

ChangeRequest.newNormal = ChangeRequestSNC.newNormal;
ChangeRequest.newStandard = ChangeRequestSNC.newStandard;
ChangeRequest.newEmergency = ChangeRequestSNC.newEmergency;
ChangeRequest.newChange = ChangeRequestSNC.newChange;
ChangeRequest.newTemplatedChange = ChangeRequestSNC.newTemplatedChange;
