var FavoritesService = Class.create();
FavoritesService.prototype = {
    initialize: function() {},

    /**
     * Inserts or returns an existing favorite artifact
     * @param {Object} data - CreateFavouritesInput
     * @returns {FavouritesData | Error}
     */
    createFavorite: function(data) {
        try {
            if (!data.name || !data.scope || !data.type || !data.artifactId || !data.artifactTable) {
                return this._error('VALIDATION_FAILED', 'Missing required fields : name, scope, type, artifactId,  artifactTable');
            }

            var category = data.category || 'favorite'; // default category
            var user = gs.getUserName();
            var gr = new GlideRecord('sys_hub_favorite_artifacts');
            gr.addQuery('artifact_id', data.artifactId);
            gr.addQuery('sys_created_by', user);
            gr.query();

            if (gr.next()) {
                return this._error('', 'Favorite already exists for this user and artifact');
            }

            var artifactGr = new GlideRecord(data.artifactTable);
            artifactGr.addQuery('sys_id', data.artifactId);
            artifactGr.query();
            if (!artifactGr.next()) {
                return this._error('', 'Definition does not exists for this artifact');
            }

            gr.initialize();
            gr.setValue('internal_name', data.name);
            gr.setValue('application_scope', data.scope);
            gr.setValue('type', data.type);
            gr.setValue('artifact_id', data.artifactId);
            gr.setValue('artifact_table', data.artifactTable);
            if (data.category) gr.setValue('category', data.category);
            gr.insert();

            var response = this._buildResponse(data.type, data.artifactId, category, data.name);
            return response;
        } catch (e) {
            return this._error('MUTATION_FAILED', e.message || e.toString());
        }
    },

    /**
     * Fetch favorites based on filters
     * @param {Object} filters
     * @returns {[FavouritesData] | Error}
     */
    getFavoritesData: function(filters) {
        try {
            var fdata = [];
            var gr = new GlideRecord('sys_hub_favorite_artifacts');

            var map = {
                category: 'category',
                type: 'type',
                scope: 'application_scope'
            };

            for (var key in map) {
                if (filters[key]) {
                    gr.addQuery(map[key], filters[key]);
                }
            }
            var user = gs.getUserName();
            gr.addQuery('sys_created_by', user);

            // Pagination defaults
            var limit = 50;
            var offset = 0;
            var count = 0;
            var processed = 0;
            var resultsExceedLimit = false;

            if (filters.limit) {
                limit = filters.limit;
            }
            if (filters.offset) {
                offset = filters.offset;
            }

            gr.orderBy('type');
            gr.query();
            while (gr.next()) {
                if (count++ < offset) continue;
                if (processed++ >= limit) {
                    resultsExceedLimit = true;
                    break;
                }
                var type = gr.getValue('type');
                var sysId = gr.getValue('artifact_id');
                var category = gr.getValue('category');
                var name = gr.getValue('internal_name');

                var record = this._buildResponse(type, sysId, category, name);

                if (record) {
                    fdata.push(record);
                }
            }

            return {
                data: fdata,
                resultsExceedLimit: resultsExceedLimit
            };
        } catch (e) {
            return this._error('QUERY_FAILED', e.message || e.toString());
        }
    },

    /**
     * Delete favorite by name and scope
     * @param {Object} data - DeleteFavouritesInput
     * @returns {DeleteFavoriteSuccess | Error}
     */
    deleteFavorite: function(data) {
        try {
            if (!data.artifactId) {
                return this._error('VALIDATION_FAILED', 'Missing required parameter : artifactId');
            }

            var user = gs.getUserName();
            var gr = new GlideRecord('sys_hub_favorite_artifacts');
            gr.addQuery('artifact_id', data.artifactId);
            gr.addQuery('sys_created_by', user);
            gr.query();

            if (gr.next()) {
                gr.deleteRecord();
                return {
                    success: true,
                    message: 'Record deleted successfully'
                };
            }

            return this._error('NOT_FOUND', 'No matching favorite artifact found for deletion');
        } catch (e) {
            return this._error('MUTATION_FAILED', e.message || e.toString());
        }
    },

    _buildResponse: function(artifactType, sysId, category, internalName) {
        var tableMap = {
            'ACTION': 'sys_hub_action_type_definition',
            'SUBFLOW': 'sys_hub_flow',
            'LOGIC': 'sys_hub_flow_logic_definition',
            'TRIGGER': 'sys_hub_trigger_definition'
        };

        var tableName = tableMap[artifactType];
        if (!tableName) {
            gs.warn('[FavoritesService] Unknown artifact type: ' + artifactType);
            return null;
        }

        var record = this._getLatestArtifact(tableName, sysId);

        if (record) {
            return {
                id: record.id,
                name: internalName,
                description: record.description,
                scope: record.scope,
                scopeName: record.scopeName,
                category: category,
                state: record.state,
                type: artifactType
            };
        }
        return null;

    },

    _getLatestArtifact: function(tableName, sysId) {
        var gr = new GlideRecord(tableName);
        gr.addQuery('sys_id', sysId);
        gr.query();

        if (gr.next()) {
            var record = {
                id: gr.getValue('sys_id'),
                description: gr.getValue('description'),
                scope: gr.getValue('sys_scope'),
                scopeName: gr.getDisplayValue('sys_scope'),
                state: ''
            };

            var stateFieldMap = {
                'sys_hub_trigger_definition': 'state',
                'sys_hub_flow': 'status',
                'sys_hub_action_type_definition': 'state'
            };

            record.state = stateFieldMap[tableName] ? gr.getValue(stateFieldMap[tableName]) : '';

            return record;
        }

        return null;
    },

    _error: function(type, message) {
        return {
            errorType: type || 'UNKNOWN',
            message: message || 'Unexpected error occurred',
            header: 'FavoritesService Error'
        };
    },

    type: 'FavoritesService'
};
