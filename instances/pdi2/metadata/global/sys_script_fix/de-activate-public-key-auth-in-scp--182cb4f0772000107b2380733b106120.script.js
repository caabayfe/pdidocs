deactivateUnsupportedPublicKeyOptionFromSCP();

        function deactivateUnsupportedPublicKeyOptionFromSCP() {
            var choiceGlideRecord = new GlideRecord('sys_choice');
            choiceGlideRecord.addQuery('name','sys_data_source');
            choiceGlideRecord.addQuery('element', 'scp_authentication');
            choiceGlideRecord.addQuery('value','Public key');
            choiceGlideRecord.setLimit(1);
            choiceGlideRecord.query();
            if(choiceGlideRecord.next())	{
                choiceGlideRecord.setValue('inactive', 1);
                choiceGlideRecord.update();
            }
}
