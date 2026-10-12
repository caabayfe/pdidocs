var EmailClientRecipientListHandler = Class.create();
EmailClientRecipientListHandler.prototype = Object.extendsObject(sn_publications.EmailClientRecipientListHandlerSNC, {
	initialize: function () {
		sn_publications.EmailClientRecipientListHandlerSNC.prototype.initialize.call(this);
	},
	type: 'EmailClientRecipientListHandler'
});
