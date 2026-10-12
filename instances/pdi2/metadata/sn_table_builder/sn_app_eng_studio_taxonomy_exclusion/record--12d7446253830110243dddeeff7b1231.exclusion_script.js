(function(current) {

    // The application file being operated on is current. The function must return a boolean.

    /* Case 1
	Exclusion script filters out the sections that are part of sys_ui_form, by checking for number of records with combination of current[table + view] in sys_ui_section, and excludes if more than one record exists, assuming it either has a sys_ui_form record already or is an orphan section.
	
		Consider a table['Table1'] has 3 form views,
			view1 - has single section
			view2 - has 2 sections
			view3 - has 2 sections
		
		#Scenario 1 : Single section form
		  View 1 section record should not be excluded as sys_ui_form record doesnot exists.
			
		#Scenario 2 : Multi section form
		  Here, as view2 has sys_ui_form record, section records should be excluded.
		
		#Scenario 3 : Orphan section
			When view3's sys_ui_form record is deleted, the corresponding section records becomes orphan and should be filtered.
    Exclusion script checks no of records with combination of current [table + view] in sys_ui_section, and excludes if count is >1
          [Table1+view1]- 1 record - Not excluded
          [Table1+view2]- 2 records - Excluded
		  [Table1+view3]- 2 records - Excluded

    */
    var mutlipleSectionRecordExists = function() {
        var sectionGr = new GlideAggregate('sys_ui_section');
        sectionGr.addQuery('name', current.name);
        sectionGr.addQuery('view', current.view);
        sectionGr.addAggregate('COUNT');
        sectionGr.query();
        sectionGr.next();
		return sectionGr.getAggregate('COUNT') > 1;
    };

    /* Case 2:
	If a multisection form is made single section within Artemis, view record exists in both sys_ui_form and sys_ui_section, hence excluding sys_ui_section record in this scenario.
	*/
    var formRecordExists = function() {
        var formGr = new GlideAggregate('sys_ui_form');
        formGr.addQuery('name', current.name);
        formGr.addQuery('view', current.view);
        formGr.addAggregate('COUNT');
        formGr.query();
        formGr.next();
        return formGr.getAggregate('COUNT') > 0;
    };

    if (formRecordExists() || mutlipleSectionRecordExists())
        return true;

    return false;

})(current);
