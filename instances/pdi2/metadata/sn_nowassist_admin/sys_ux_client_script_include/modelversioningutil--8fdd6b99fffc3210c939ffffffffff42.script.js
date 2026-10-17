function include({imports}) { 
    class ModelVersioningUtil {
        static searchAndFilterData(data, searchTerm, filters) {
            if (!Array.isArray(data)) return [];
            
            var normalizedSearchTerm = (searchTerm || '').toLowerCase().trim();
            
            return data.filter(function(item) {
                if (normalizedSearchTerm && 
                    (!item || !item.skillName || 
                     !item.skillName.toLowerCase().includes(normalizedSearchTerm))) {
                    return false;
                }
                
                if (!filters || Object.keys(filters).length === 0) return true;
                
                var matchesFilter = function(filterArray, itemProperty) {
                    if (!filterArray || filterArray.length === 0) return true;
                    var filterIds = filterArray.map(function(f) { 
                        return f.id; 
                    });
                    return filterIds.indexOf(itemProperty) !== -1;
                };
                
                return matchesFilter(filters.skills, item.resource) &&
                       matchesFilter(filters.providers, item.genAiProvider) &&
                       matchesFilter(filters.sourceModels, item.sourceModel) &&
                       matchesFilter(filters.targetModels, item.targetModel);
            });
        }
        
        /**
         * Validates a record against all other records
         * @param {Array} skills - All skill records
         * @param {number} currentIndex - Index of record to validate
         * @param {number} updatedIndex - Index of the record that was just updated (optional)
         * @returns {string|null} - Warning type or null
         */
        static validateRecord(skills, currentIndex, updatedIndex) {
            var currentRecord = skills[currentIndex];
            if (!currentRecord) return null;
            
            var sourceModel = currentRecord.sourceModel;
            var targetModel = currentRecord.targetModel;
            var resource = currentRecord.resource;
            var genAiProvider = currentRecord.genAiProvider;
            
            // Check if source and target are the same
            if (sourceModel && targetModel && sourceModel === targetModel) {
                return 'SAME_SOURCE_TARGET';
            }
            
            // For duplicate checks, determine which records to check
            // If this is the updated record, check all others
            // Otherwise, only check earlier records to avoid double warnings
            var shouldCheckRecord = function(index) {
                if (currentIndex === updatedIndex) {
                    // This is the updated record - check all other records
                    return index !== currentIndex;
                } else {
                    // This is not the updated record - only check earlier records
                    return index < currentIndex;
                }
            };
            
            // Check if source/target create a cycle
            if (sourceModel && targetModel && resource && genAiProvider) {
                var hasInterchanged = skills.some(function(item, index) {
                    return shouldCheckRecord(index) &&
                        !item.warning &&
                        item.resource === resource &&
                        item.genAiProvider === genAiProvider &&
                        item.sourceModel === targetModel && 
                        item.targetModel === sourceModel;
                });
                
                if (hasInterchanged) return 'INTERCHANGED';
            }

            // Check if same resource, sourceModel, and provider exist with different targetModel
            if (resource && genAiProvider && sourceModel) {
                var hasConflictingTarget = skills.some(function(item, index) {
                    return shouldCheckRecord(index) &&
                        !item.warning &&
                        item.resource === resource &&
                        item.genAiProvider === genAiProvider &&
                        item.sourceModel === sourceModel 
                });
                
                if (hasConflictingTarget) return 'CONFLICTING_TARGET';
            }
            
            // Check if exact configuration exists
            if (resource && genAiProvider && sourceModel) {
                var hasDuplicate = skills.some(function(item, index) {
                    return shouldCheckRecord(index) &&
                        !item.warning &&
                        item.resource === resource && 
                        item.genAiProvider === genAiProvider && 
                        item.sourceModel === sourceModel && 
                        item.targetModel === targetModel;
                });
                
                if (hasDuplicate) return 'DUPLICATE';
            }
            
            return null;
        }

       static getWarningForSkillVersion(skills, currentIndex, updatedIndex,helpers) {
            var warningType = ModelVersioningUtil.validateRecord(skills, currentIndex, updatedIndex);
            
            if (!warningType) return Promise.resolve(null);
            
            var messagePromise;
            switch (warningType) {
                case 'SAME_SOURCE_TARGET':
                    messagePromise = helpers.translate("Default and Target cannot be same. Please select a different combination.");
                    skills[currentIndex].errorType = 'SAME_SOURCE_TARGET';
                    break;
                
                case 'INTERCHANGED':
                    messagePromise = helpers.translate("The selected options are interchanged with default model version and target model version. Please select a different combination.");
                    skills[currentIndex].errorType = 'INTERCHANGED';
                    break;

                 case 'CONFLICTING_TARGET':
                    messagePromise = helpers.translate("A configuration for this skill with the default model version already exists. Please select a different skill to proceed.");
                    skills[currentIndex].errorType = 'CONFLICTING_TARGET';
                    break;

                case 'DUPLICATE':
                    messagePromise = helpers.translate("The selected options are an existing configuration. Please select a different combination.");
                    skills[currentIndex].errorType = 'DUPLICATE';
                    break;
                
                default:
                    delete skills[currentIndex].errorType;
                    return Promise.resolve(null);
            }
            
            return messagePromise;
       }

        static populateSourceModel(sourceModels, modelsAndTypes, genAiProvider) {
            // Filter valid models (non-all items matching provider and sourceModels)
            const validModels = modelsAndTypes.filter(item =>
                item.all || (item.genAiProvider === genAiProvider && sourceModels?.includes(item.model))
            );

            // Get models excluding "all" type
            const excludeAll = validModels.filter(item => !item.all);

            // If only one specific model, return it
            if (excludeAll.length === 1) {
                return excludeAll[0];
            }

            // If multiple models, determine by type
            if (excludeAll.length > 1) {
                const isAllSLM = excludeAll.every(item => item.modelType === "SLM");
                const isAllLLM = excludeAll.every(item => item.modelType === "LLM");
                const isAllGeneric = excludeAll.every(item => item.modelType === "GENERIC");

                if (isAllLLM) {
                    return validModels.find(item => item.all && item.modelType === "LLM");
                }
                if (isAllSLM) {
                    return validModels.find(item => item.all && item.modelType === "SLM");
                }
                if (isAllGeneric) {
                    return validModels.find(item => item.all && item.modelType === "GENERIC");
                }
            }

            // Default: return first GENERIC model or first valid model
            return validModels.find(item => item.all && item.modelType === "GENERIC") || null;
        }
    }

    
    return {
        ModelVersioningUtil: ModelVersioningUtil
    };
}
