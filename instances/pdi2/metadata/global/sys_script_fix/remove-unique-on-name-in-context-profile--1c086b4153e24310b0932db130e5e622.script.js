(function() {
    var TABLE = 'sys_cs_context_profile';
    var COLUMN = 'name';

    // Drop the old single-column unique index (normal upgrade merge only adds indexes declared in the schema XML, it never drops ones no longer declared)
    var util = new GlideIndexUtils();
    util.dropByExactElementSequence(TABLE, true, [COLUMN]);

    // Flip sys_dictionary.unique to false - TableUpgrade skips re-syncing this attribute for fields already registered in the dictionary, so it won't get corrected by the normal plugin upgrade merge
    var dictGr = new GlideRecord('sys_dictionary');
    dictGr.addQuery('name', TABLE);
    dictGr.addQuery('element', COLUMN);
    dictGr.query();
    if (dictGr.next()) {
		dictGr.setValue('unique', false);
        dictGr.update();
    } else {
        gs.error('Fix script: could not find sys_dictionary entry for ' + TABLE + '.' + COLUMN);
    }
})();
