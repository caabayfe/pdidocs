var ScopedSessionDomain = Class.create();
ScopedSessionDomain.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getCurrentDomainID : function() {
		return GlideSession.get().getCurrentDomainID();
	},
    type: 'ScopedSessionDomain'
});
