(function() {
    var domainId = event.parm2;
    if (domainId) {
        gs.getSession().setDomainID(domainId);
    }
    var errorData = JSON.parse(event.parm1);
    EFErrorRepository.saveError(errorData);
})();
