var ChangeProcess = Class.create();

ChangeProcess.newChangeProcess = ChangeProcessSNC.newChangeProcess;
ChangeProcess.newChange = ChangeProcessSNC.newChange;
ChangeProcess.findAll = ChangeProcessSNC.findAll;
ChangeProcess.findById = ChangeProcessSNC.findById;

ChangeProcess.prototype = Object.extendsObject(ChangeProcessSNC, {
	initialize: function(_gr, _gs) {
		ChangeProcessSNC.prototype.initialize.call(this, _gr, _gs);
	},

    type: "ChangeProcess"
});
