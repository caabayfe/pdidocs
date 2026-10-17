class AisPlatformConfigHelper {
    constructor() {
        this.aisConfigs = {
            sys_sg_button: {
                ais_datasource: '36888e6f7702021054df7f7c8c5a9955',
                sys_search_context_config: ['038802af7702021054df7f7c8c5a9952'],
                defaultSearchResultFields: [
                    'sys_id',
                    'name',
                    'sys_scope',
                    'context',
                    'table',
                    'sys_class_name',
                    'sys_updated_on',
                  ],
            },
            sys_sg_data_item: {
                ais_datasource: 'd44d277e5333021075b9ddeeff7b12ce',
                sys_search_context_config: ['c94d677e5333021075b9ddeeff7b1257'],
                defaultSearchResultFields: [
                    'sys_id',
                    'name',
                    'sys_scope',
                    'table',
                    'sys_class_name',
                    'sys_updated_on',
                  ],
            },
            sys_sg_icon: {
                ais_datasource: 'b38223c25392021054dfddeeff7b123a',
                sys_search_context_config: ['b38223c25392021054dfddeeff7b127f'],
                defaultSearchResultFields: [
                    'sys_id',
                    'name',
                    'icon',
                    'sys_scope',
                    'type',
                    'sys_class_name',
                    'sys_updated_on',
                  ],
            },
            sys_sg_item_stream: {
                ais_datasource: 'a675d9ac53e8121075b9ddeeff7b12c6',
                sys_search_context_config: ['07755520532c121075b9ddeeff7b12b6'],
                defaultSearchResultFields: [
                    'sys_id',
                    'name',
                    'data_item',
                    'table',
                    'sys_scope',
                    'sys_class_name',
                    'sys_updated_on',
                  ],
            },
            sys_sg_view_config: {
                ais_datasource: 'cc98c2af7702021054df7f7c8c5a99da',
                sys_search_context_config: ['549846af7702021054df7f7c8c5a990a'],
                defaultSearchResultFields: [
                    'sys_id',
                    'name',
                    'sys_scope',
                    'table',
                    'sys_class_name',
                    'sys_updated_on',
                  ],
            },
            sys_sg_view_template: {
                ais_datasource: '6898c6af7702021054df7f7c8c5a990d',
                sys_search_context_config: ['bc980aaf7702021054df7f7c8c5a9936'],
                defaultSearchResultFields: [
                    'sys_id',
                    'name',
                    'sys_scope',
                    'sys_class_name',
                    'sys_updated_on',
                  ],
            },
        };
    }

    getAisTables() {
        return Object.keys(this.aisConfigs);
    }

    getAisDatasourceId(tableName) {
        return this.aisConfigs[tableName].ais_datasource;
    }

    getSysSearchContextConfigIds(tableName) {
        return this.aisConfigs[tableName].sys_search_context_config;
    }

    getDefaultSearchResultFields(tableName) {
        return this.aisConfigs[tableName].defaultSearchResultFields;
    }
}

module.exports = AisPlatformConfigHelper;
