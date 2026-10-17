var docDict = new GlideRecord('sys_dictionary');
docDict.addEncodedQuery('name=ds_document^elementINstate,default_version');
docDict.addActiveQuery();
docDict.query();
while (docDict.next()) {
    docDict.setValue('read_only', true);
    docDict.update();
}

docDict = new GlideRecord('sys_dictionary');
docDict.addEncodedQuery('name=ds_document^elementINstate');
docDict.addActiveQuery();
docDict.query();
while (docDict.next()) {
    docDict.setValue('choice', 3);
    docDict.update();
}

choiceDict = new GlideRecord('sys_choice');
choiceDict.addEncodedQuery('name=ds_document^element=state^valueINsubmit,review,complete');
choiceDict.addActiveQuery();
choiceDict.query();
while (choiceDict.next()) {
    choiceDict.setValue('inactive', true);
    choiceDict.update();
}

var docVersionDict = new GlideRecord("sys_dictionary");
docVersionDict.addEncodedQuery("internal_type=collection^name=ds_document_version");
docVersionDict.addActiveQuery();
docVersionDict.query();
while (docVersionDict.next()) {
    docVersionDict.setValue("audit", true);
    docVersionDict.update();
}
