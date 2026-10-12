const PageProperty = Class.create();
PageProperty.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_page_property',
    FIELDS: ['page', 'name', 'type', 'value', 'route', 'suffix', 'description'],
    DEFAULTS: {
        chrome_header: {
            privatePage: {
                userPrefsEnabled: false,
                searchEnabled: false,
                currentScreenLinkConfiguration: {},
                globalTools: {
                    collapsingMenuId: 0,
                    primaryItems: [],
                    secondaryItems: [],
                },
            },
            publicPage: {
                menuEnabled: false,
                searchEnabled: false,
                logoRoute: {},
                actionButtons: [],
            }
        },
        chrome_footer: {
            public_page: {
                enable_footer_topbar: false,
                footer_topbar_options: {},
                enable_footer_bar: false,
                footer_bar_options: {},
            }
        },
    },
    MAPPING: {
        chrome_header: {
            name: 'header',
            key_map: [{
                param: 'searchPrivate',
                parent: 'privatePage',
                key: 'searchEnabled'
            }, {
                param: 'searchPublic',
                parent: 'publicPage',
                key: 'searchEnabled'
            }, {
                param: 'notifications',
                parent: 'privatePage',
                key: 'notificationsEnabled'
            }, {
                param: 'menu',
                parent: 'publicPage',
                key: 'menuEnabled'
            }]
        },
        chrome_footer: {
            name: 'footer',
            key_map: [{
                param: 'primaryFooter',
                parent: 'public_page',
                key: 'enable_footer_topbar'
            }, {
                param: 'secondaryFooter',
                parent: 'public_page',
                key: 'enable_footer_bar'
            }]
        },
        globalSearchDataConfigId: {
            name: 'search',
            param: 'selectedSearchSource'
        },
        chrome_toolbar: {
            name: 'toolbar',
            param: 'buttons'
        },
        alert_auto_dismiss_config: {
            name: 'alerts',
            param: 'alertAutoDismissConfig'
        },
        auto_expand_now_alert_message: {
            name: 'autoExpandAlert',
            param: 'autoExpandAlertMessage'
        }
    },


    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },
    createDefaultProperties: function(encodedQuery) {
        const that = this;
        Object.entries(this.DEFAULTS).forEach(function([key, value]) {
            const propEncodedQuery = `${encodedQuery}^name=${key}`;
            const doesPropExist = that.checkIfRecordsExist(propEncodedQuery);
            if (!doesPropExist) {
                that.createRecord({
                    value: that.stringifyJSON(value),
                    type: 'json'
                }, propEncodedQuery);
            }
        });
    },
    getProperties: function(encodedQuery, orderBy) {
        const that = this;
        let returnProps = [];
        const propsGR = this.getRecordsByQuery(encodedQuery, orderBy);
        if (propsGR) {
            returnProps = propsGR.reduce(function(acc, propGR) {
                const name = propGR.name.displayValue;
				const type = propGR.type.value;
                const mapping = that.MAPPING[name];
                if (mapping) {
                    const mappingName = mapping.name;
                    const propValue = propGR.value ? propGR.value.value : '';
                    propGR.value = mapping.key_map ? mapping.key_map.reduce(function(kmAcc, km) {
						if(propValue[km.parent]){
							kmAcc[km.param] = propValue[km.parent][km.key];
						}
                        return kmAcc;
                    }, {}) : {
                        [mapping.param]: propValue === "null" ? '' : propValue
                    }; 
                    propGR.name = mappingName;
                    acc.push(propGR);
                }
                return acc;
            }, returnProps);
        }
        return returnProps;
    },
    updateProps: function(experienceId, {
        header,
        footer,
        search,
        toolbar,
        alerts,
        autoExpandAlert
    }) {
        return {
            header: this.upsertHeader(experienceId, header),
            footer: this.upsertFooter(experienceId, footer),
            search: this.upsertSearch(experienceId, search),
            toolbar: this.upsertToolbar(experienceId, toolbar),
            alerts: this.upsertAlerts(experienceId, alerts),
            autoExpandAlert: this.upsertAutoDismissAlert(experienceId, autoExpandAlert),
        };
    },
    upsertAlerts: function(experienceId, alertProperties) {
        const encodedQuery = `page=${experienceId}^route=NULL^name=alert_auto_dismiss_config`;
		const alertAutoDismissConfig = alertProperties ? alertProperties : {};
        const propsGR = this.getRecordsByQuery(encodedQuery, null, true);
        if (propsGR && propsGR.next()) {
            propsGR.value = this.stringifyJSON(alertAutoDismissConfig);
            return propsGR.update();
        } else {
            return this.createRecord({
                value: this.stringifyJSON(alertAutoDismissConfig),
                type: 'string'
            }, encodedQuery);
        }
    },
    upsertAutoDismissAlert:function(experienceId, autoExpandAlertProperties) {
        const encodedQuery = `page=${experienceId}^route=NULL^name=auto_expand_now_alert_message`;
		const autoExpandAlertConfig = autoExpandAlertProperties ? autoExpandAlertProperties : false;
        const propsGR = this.getRecordsByQuery(encodedQuery, null, true);
        if (propsGR && propsGR.next()) {
            propsGR.value = this.stringifyJSON(autoExpandAlertConfig);
            return propsGR.update();
        } else {
            return this.createRecord({
                value: this.stringifyJSON(autoExpandAlertConfig),
                type: 'boolean'
            }, encodedQuery);
        }
    },
    upsertHeader: function(experienceId, headerProperties) {
        return this._upsertJSONProperties(experienceId, headerProperties, 'chrome_header');
    },
    upsertFooter: function(experienceId, footerProperties) {
        return this._upsertJSONProperties(experienceId, footerProperties, 'chrome_footer');
    },
    upsertSearch: function(experienceId, selectedSearchSource) {
        const encodedQuery = `page=${experienceId}^route=NULL^name=globalSearchDataConfigId`;
		const tempSelectedSearchSource = selectedSearchSource ? selectedSearchSource : "null";
        const propsGR = this.getRecordsByQuery(encodedQuery, null, true);
        if (propsGR && propsGR.next()) {
            propsGR.value = tempSelectedSearchSource;
            return propsGR.update();
        } else {
            return this.createRecord({
                value: tempSelectedSearchSource,
                type: 'string'
            }, encodedQuery);
        }
    },
    upsertToolbar: function(experienceId, {
        buttons = []
    }) {
        const preppedButtons = buttons.length === 0 ? [] : this._prepButtons(buttons);
        const encodedQuery = `page=${experienceId}^route=NULL^name=chrome_toolbar`;
        const propsGR = this.getRecordsByQuery(encodedQuery, null, true);
        if (propsGR && propsGR.next()) {
            propsGR.value = this.stringifyJSON(preppedButtons);
            return propsGR.update();
        } else {
            if (buttons.length !== 0) {
                return this.createRecord({
                    value: this.stringifyJSON(preppedButtons),
                    type: 'json'
                }, encodedQuery);
            }
        }
    },
	/**
     * @param fields {object} an object with record keys in camel case and values
     */
    createRecord: function({value, type}, encodedQuery) {
        const recordGR = new GlideRecordSecure(this.table);
        if (recordGR.canCreate()) {
            recordGR.initialize();
            if (encodedQuery) {
                recordGR.applyEncodedQuery(encodedQuery);
            }
			recordGR.setValue('value', value);
			recordGR.setValue('type', type);
            return recordGR.insert();
        }
        return {
            error: true,
            reason: BuilderToolkitConstants.ERRORS.WRITE_ACCESS_ERROR_MESSAGE
        };
    },
    _upsertJSONProperties: function(experienceId, property, propName) {
        const mapping = this.MAPPING[propName];
        const encodedQuery = `page=${experienceId}^route=NULL^name=${propName}`;
        const propsGR = this.getRecordsByQuery(encodedQuery, null, true);
        if (propsGR && propsGR.next()) {
            const valueJSON = this.parseJSON(propsGR.getValue('value'));
            propsGR.value = this.stringifyJSON(this._setJSONPropertyValue(valueJSON, property, mapping));
            return propsGR.update();
        } else {
            const valueJSON = this.DEFAULTS[propName];
            return this.createRecord({
                value: this.stringifyJSON(this._setJSONPropertyValue(valueJSON, property, mapping)),
                type: 'json'
            }, encodedQuery);
        }
    },
    _setJSONPropertyValue: function(valueJSON, property, mapping) {
        mapping.key_map.forEach(function(km) {
            valueJSON[km.parent][km.key] = property[km.param];
        });
        return valueJSON;
    },
    _prepButtons: function(buttons) {
        const that = this;
        return buttons.map(that._prepButton);
    },
    _prepButton: function({
        label,
        icon,
        routeInfo,
        group,
        route,
        order = 0,
        badge = {},
        presence = {},
        availability = {},
        viewportInfo = {},
    }) {
        return {
            id: route,
            label: {
                translatable: true,
                message: label
            },
            icon,
            routeInfo : routeInfo ? routeInfo : {route},
            group,
            order,
            badge,
            presence,
            availability,
            viewportInfo
        }
    },
    type: 'PageProperty'
});
