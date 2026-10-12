// updating the assets
var assetRecord = new GlideRecord('clm_m2m_contract_asset');
assetRecord.addQuery('contract', current.sys_id);
assetRecord.addQuery('removed', previous.ends);
assetRecord.query();
while(assetRecord.next()){
    if(current.process == 'renewal')
        assetRecord.added = current.starts;
    assetRecord.removed = current.ends;
    assetRecord.update();
}

//updating the users
var userRecord = new GlideRecord('clm_m2m_contract_user');
userRecord.addQuery('contract', current.sys_id);
userRecord.addQuery('removed', previous.ends);
userRecord.query();
while(userRecord.next()){
    if(current.process == 'renewal')
        userRecord.added = current.starts;
    userRecord.removed = current.ends;
    userRecord.update();
}
