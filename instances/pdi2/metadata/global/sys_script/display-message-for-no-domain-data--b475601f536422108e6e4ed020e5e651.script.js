(function executeRule(current, previous /*null when async*/ ) {

        var inactiveDomainDataGr = new GlideRecord('inactive_domain_data');
        inactiveDomainDataGr.addQuery('inactive_domain', current.sys_id);
        inactiveDomainDataGr.setLimit(1);
        inactiveDomainDataGr.query();
        if (!inactiveDomainDataGr.hasNext()) {
            gs.addInfoMessage(gs.getMessage('No_Domain_Data_UI_Message', current.domain.name));
        }

})(current, previous);
