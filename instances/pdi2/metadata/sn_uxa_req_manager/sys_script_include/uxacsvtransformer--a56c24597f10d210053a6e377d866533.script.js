var UXACSVTransformer = Class.create();
UXACSVTransformer.prototype = {
    initialize: function() {},

    transform: function(jsonData, uxaDTO) {
        const result = [];

        if (UXAConstants.TYPE.PAGES == uxaDTO.getType() && uxaDTO.getApplicationSysId()) {
            this._updatePageNames(uxaDTO, jsonData);
        }

        const headers = jsonData.columns.map(column => {
            return this.escapeCsvField(this.getTranslatedColumnHeader(column[0], uxaDTO));
        }).join(',');
        result.push(headers);

        const rows = jsonData.rows.forEach(row => {
            if (!Array.isArray(row) || row.length !== jsonData.columns.length) {
                throw new Error("Row length does not match column length.");
            }
            result.push(row.map(this.escapeCsvField).join(","));
        });

        return {
            csvData: result
        };
    },

    _updatePageNames: function(uxaDTO, data) {
        const pageNames = this._getPageDisplayNames(uxaDTO.getChannel(), uxaDTO.getApplicationSysId());
        const pageNameColumnIndex = data.columns.findIndex(column => column[0] == UXAConstants.NAME_ALIAS);

        if (pageNameColumnIndex > -1) {
            data.rows.forEach(row => {
                const element = row[pageNameColumnIndex]
                row[pageNameColumnIndex] = pageNames[element] || element;
            })
        }
    },

    _getPageDisplayNames: function(channel, appSysId) {
        const params = {
            app_sys_id: appSysId,
            channel: channel
        };
        const pageNames = new QueryServiceAPI().getPageNames(params);
        return Object.assign({}, ...pageNames.map(item => ({
            [item.k]: item.v
        })));
    },

    getTranslatedColumnHeader: function(columnName, uxaDTO) {
        const channel = uxaDTO.getChannel();
        const uxaUtils = new UXAUtils();
        if (UXAConstants.METRIC.EVENT_EXPORT === uxaDTO.getMetric()) {
            return uxaUtils.getDatatableUIFields(UXAConstants.METRIC.EVENT_EXPORT.toUpperCase(), channel, uxaDTO, columnName)?.uiLabel || columnName;
        }
        let labelKey = 'uiLabel';
        if (channel == UXAConstants.CHANNEL_ENUM.MOBILE.ID && columnName.toLowerCase() == 'number_of_pages')
            labelKey = 'uiLabelMobile';

        return uxaUtils.getDatatableUIFields(uxaDTO.getType().toUpperCase(), channel, uxaDTO, columnName)?.[labelKey] || columnName;
    },
    escapeCsvField: function(field) {
        if (typeof field === 'string') {
            // Escape double quotes by doubling them
            field = field.replace(/"/g, '""');

            // If the field contains a comma, newline, or double quote, wrap it in double quotes
            if (field.includes(',') || field.includes('\n') || field.includes('"')) {
                field = `"${field}"`;
            }
        }

        return field;
    },

    type: 'UXACSVTransformer'
};
