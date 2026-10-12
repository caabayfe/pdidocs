if (!pm.isZboot()) {
    gs.log('Running fix script to update hint in  Knowledge Based Answer Table', 'KBAUserColumnUpdate');
    var docGR = new GlideRecord('sys_documentation');
    docGR.addQuery('name', 'knowledge_based_answer');
    docGR.addQuery('element', 'user_column');
    docGR.query();

    if (docGR.next()) {
        docGR.setValue('hint', 'To configure the User Column as optional, set the system property glide.auth_factors.kba.enable_user_column to false');
        docGR.update();
        gs.log('Update hint in Knowledge Based Answer Table is complete', 'KBAUserColumnUpdate');
    }
}
