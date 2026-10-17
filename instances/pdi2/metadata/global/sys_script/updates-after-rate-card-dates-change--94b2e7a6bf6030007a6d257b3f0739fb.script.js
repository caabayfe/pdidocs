// updating the assets
var assetRecord = new GlideRecord('clm_m2m_rate_card_asset');
assetRecord.addQuery('rate_card', current.sys_id);
assetRecord.addQuery('removed', previous.end_date);
assetRecord.query();
while(assetRecord.next()){
    if(current.contract.process == 'renewal')
        assetRecord.added = current.start_date;
    assetRecord.removed = current.end_date;
    assetRecord.update();
}

//updating the users
var userRecord = new GlideRecord('clm_m2m_rate_card_user');
userRecord.addQuery('rate_card', current.sys_id);
userRecord.addQuery('removed', previous.end_date);
userRecord.query();
while(userRecord.next()){
    if(current.contract.process == 'renewal')
        userRecord.added = current.start_date;
    userRecord.removed = current.end_date;
    userRecord.update();
}
