var FileDataBuilder = (function() {
    var exclusionsByTable = getExclusionsByTable();

    return {
        build: function(applicationIds) {
            return buildProjectObjectFiles(applicationIds);
        },
		
		buildProvidedFiles: function(applicationSysId, fileIds, tableName) {			
			return decorateProvidedFiles(applicationSysId, fileIds, tableName);
		}
    };
	
    function getExclusionsByTable() {
        var exclusions = {};
        var grExclusionList = new GlideRecord('sn_app_eng_studio_taxonomy_exclusion');
            grExclusionList.addQuery('active', true);
            grExclusionList.query();

        while (grExclusionList.next()) {
            var tableName = grExclusionList.taxonomy.table;
            exclusions[tableName] = (exclusions[tableName] || []).concat([grExclusionList.getValue("sys_id")]);
        }
        
        return exclusions;
    }
	
	function buildProjectObjectFiles(applicationIds) {
		var projectObjectFiles = [];
		
		var taxDefinitionRecord = new GlideRecord("sn_app_eng_studio_taxonomy");
		taxDefinitionRecord.query();

		while (taxDefinitionRecord.next()) {
			var projectObjects = getProjectFilesForTaxonomy(applicationIds, taxDefinitionRecord);
			var referencedProjectObjects = getReferencedProjectFilesForTaxonomy(applicationIds, taxDefinitionRecord);
			projectObjectFiles = projectObjectFiles.concat(projectObjects);
			projectObjectFiles = projectObjectFiles.concat(referencedProjectObjects);
		}
		return projectObjectFiles;
	}
	
	function decorateProvidedFiles(applicationSysId, fileIds, tableName) {
		var decoratedFiles = [];
		var	appObjects;
		var referencedObjects;
		var unfoundFileSysIds = fileIds;
		
		var taxDefinitionRecord = new GlideRecord("sn_app_eng_studio_taxonomy");
		var hasTaxDefRecord = taxDefinitionRecord.get('table', tableName);

		if(!hasTaxDefRecord) {
			throw CreatorStudioConstants.errors.TAXONOMY_DOES_NOT_EXIST;			
		}
				
		// TODO: This can be improved. As we should only really query for only files we need
		//       taking a shortcut for now.
		appObjects = getProjectFilesForTaxonomy([applicationSysId], taxDefinitionRecord);
		referencedObjects = getReferencedProjectFilesForTaxonomy([applicationSysId], taxDefinitionRecord);
		
		decoratedFiles = decoratedFiles.concat(appObjects);
		decoratedFiles = decoratedFiles.concat(referencedObjects);

		// Since all the files are returned for a given table_name, filter out only the ones requested
		decoratedFiles = decoratedFiles.filter(function (file) {
			var found = fileIds.indexOf(file.sys_id) > -1;
			
			if(found) {
				// Keeping track of the files that were found so that we can look for roles outside the app scope
				unfoundFileSysIds = unfoundFileSysIds.filter(function(sysId) {
					return sysId !== file.sys_id;
				});
			}
			return found;
		});
		
		
		// Special case for referenced role. Sometimes we need to return a decorated referenced role but
		// no references exist yet. In this case, we are just grabbing the record outside the app scope and decorating it.
		if (tableName === 'sys_user_role' && unfoundFileSysIds.length > 0) {
			
			var sysUserRoleRecords = new GlideRecord("sys_user_role");
			sysUserRoleRecords.addQuery('sys_id', 'IN', unfoundFileSysIds );
			
			sysUserRoleRecords.query();
			
			if (sysUserRoleRecords) {
				var referencedRole = validateAndDecorateFiles(sysUserRoleRecords, taxDefinitionRecord, { isReference: true }); 
				decoratedFiles = decoratedFiles.concat(referencedRole);
			} 
		}
	
		// Tack on the taxonomy definition to all the files
		decoratedFiles = addTaxonomyDefToFiles(decoratedFiles, taxDefinitionRecord);
		
        return decoratedFiles;
	}
	
	function addTaxonomyDefToFiles(files, taxDefinitionRecord) {
		var taxonomyDef = new TaxonomyDefinitionsDataModel().generateSingleTaxonomy(taxDefinitionRecord.getValue('sys_id'));
		
		if(!taxonomyDef) {
			return files;
		}
		
		return (
			files.map(function(file) {
				file.taxonomy_definition = taxonomyDef;
				return file;
			})
		);
	}

    function getProjectFilesForTaxonomy(applicationIds, taxDefinitionRecord) {

        var tableName = taxDefinitionRecord.getValue("table");
        var records = getTableRecords(applicationIds, tableName);

        return validateAndDecorateFiles(records, taxDefinitionRecord, {});
    }

    function getReferencedProjectFilesForTaxonomy(applicationIds, taxDefinitionRecord) {

        var fileObjects = [];

        var dataRetrieverField = 'references_script';

        var dataRetrieverRecord = new GlideRecord("sn_app_eng_studio_taxonomy_details");

        dataRetrieverRecord.get('taxonomy_id', taxDefinitionRecord.getValue('sys_id'));

        var evaluator = new GlideScopedEvaluator();

        if (dataRetrieverRecord[dataRetrieverField]) {
            var records = evaluator.evaluateScript(dataRetrieverRecord, dataRetrieverField, {
                sysIds: applicationIds.join()
            });
			
			var referencedData = {
				'isReference': true
			};

			if(dataRetrieverRecord.name_override_enabled && dataRetrieverRecord.name_override){
				referencedData.taxonomyDetailRecord = dataRetrieverRecord;
			}
			

            fileObjects = validateAndDecorateFiles(records, taxDefinitionRecord, referencedData);
        }

        return fileObjects;
    }
	
    function shouldExcludeRecord(record, exclusions) {
        if(!exclusions || exclusions.length === 0) return false;
        
        return exclusions.some(function(exclusionRecordId) {
            var exclusionRecord = new GlideRecord("sn_app_eng_studio_taxonomy_exclusion");
            exclusionRecord.get(exclusionRecordId);
            if (!exclusionRecord.isValidRecord()) return false;
            
            try {
                if(exclusionRecord.advanced) {
                    var evaluator = new GlideScopedEvaluator();
                    
                    return !!(evaluator.evaluateScript(exclusionRecord, "exclusion_script", {
                        current: record
                    }));
            
                } else {
                    var exclusionRegex = new RegExp(exclusionRecord.getValue("regular_expression"));
                    var testField = record.getValue(exclusionRecord.getValue("field_name"));

                    return exclusionRegex.test(testField);
                }
            }
            catch(e) {
                return false;
            }
        });		
    }

	//TODO: Consider renaming this since it includes the exclusions now
    function validateAndDecorateFiles(records, taxDefinitionRecord, referencedData) {
        var fileObjects = [];
        var sysAppInfoDictionary = {};

        var tableName = taxDefinitionRecord.getValue("table");
        var exclusions = exclusionsByTable[tableName];

        while (records.next()) {
            if(shouldExcludeRecord(records, exclusions)) {
                continue;
            }
            
            if (AccessValidator.canReadRecord(records)) {
                var fileDataDecorator = new FileDataDecorator(records, taxDefinitionRecord, referencedData);
                var fileObject = fileDataDecorator.decorate();

                addSysAppInfoFileMetaData(sysAppInfoDictionary, fileObject);

                fileObjects.push(fileObject);
            }
        }

        return fileObjects;
    }

    function addSysAppInfoFileMetaData(sysAppInfoDictionary, fileObject) {
        try {
            var appSysId = fileObject.application;
            var sysAppInfoUtils = sysAppInfoDictionary[appSysId];

            if (!sysAppInfoUtils) {
                sysAppInfoDictionary[appSysId] = new SysAppInfoUtils(appSysId);
                sysAppInfoUtils = sysAppInfoDictionary[appSysId];
            }

            fileObject.generated_by_ai = sysAppInfoUtils.getIsFileGeneratedFromAI(fileObject.sys_id);
            fileObject.in_review = sysAppInfoUtils.getIsFileInReview(fileObject.sys_id);

        } catch (ex) {
            gs.warning('FileDataBuilder.addSysAppInfoFileMetaData unable to add sys_app_info file meta data');
        }

    }

    function getTableRecords(applicationIds, tableName) {
        /*
        NOTE: Long term goal is to refactor the data model for the taxonomy definition to handle these 
        types of exceptions rather than hard-coding them. Consult with team prior to adding additional 
        conditions.
        */

        if (tableName === 'sys_dictionary')
            return getSysDictionaryTableRecords(applicationIds);

        var records = new GlideRecord(tableName);

        records.addQuery('sys_scope', 'IN', applicationIds);
		if (tableName === 'sc_cat_item') {
			/* excluding redundant sc_cat_item_producer from this table */
			records.addQuery('sys_class_name', 'sc_cat_item');
		}
		
        records.query();

        return records;
    }

    function getSysDictionaryTableRecords(applicationIds) {

        var records = new GlideRecord('sys_dictionary');

        records.addQuery('sys_scope', 'IN', applicationIds);
        records.addQuery('internal_type', '!=', 'collection');
        records.addQuery('sys_class_name', 'NOT IN', getExcludedTables());
        records.addQuery('name', 'NOT IN', getScopedTables(applicationIds));
        records.orderBy('sys_name');
        records.query();

        return records;
    }

    function getScopedTables(appIds) {

        var tables = [];

        var gr = new GlideRecord('sys_dictionary');

        gr.addQuery('sys_scope', 'IN', appIds);
        gr.addQuery('internal_type', 'collection');
        gr.query();

        while (gr.next()) {
            tables.push(gr.getValue('name'));
        }

        return tables.join(',');
    }

    function getExcludedTables() {
        return [
            'sys_hub_action_input',
            'sys_hub_action_output',
            'sys_hub_step_ext_input',
            'sys_hub_step_ext_output',
            'sys_hub_flow_input',
            'sys_hub_flow_output'
        ];
    }


})();
