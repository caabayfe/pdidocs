function include() {
    const validateDirtyStatus = ({ api, event }) => {
        const { isDirty } = api.state;
        const { name, payload } = event;
        if (isDirty) {
            api.emit('LIST_CTRL#OPEN_MODAL', {
                route: 'discard-changes',
            });
            api.setState('callbackEvent', {
                name,
                payload,
            });
            return true;
        }

        return false;
    };

    /**
     * Returns the effective view for the list, based on selectedListMenuItem and props.
     * - If a list menu item is selected, prefer its 'view' property.
     * - If 'view' is not set on the selected menu item, fallback to the view from component props.
     * - RLB: If selectedListMenuItem exists, but its view is an empty string and it has no columns,
     *   force the view to default (""). This ensures the default system view is used when both are empty.
     */
    const getEffectiveView = (api) => {
        const { selectedListMenuItem } = api.data.sn_record_list_data_broker.out.listMenuModel || {};
        const { view: itemView, columns: menuItemColumns } = selectedListMenuItem ?? {};
        let view = itemView ?? api.context.props.view;
        if (selectedListMenuItem && itemView === "" && !menuItemColumns) view = "";
        return view;
    };

    class ListColumnPreferences {
        constructor(api) {
            this.api = api;
            this.table = api.data.sn_record_list_data_broker.out.table;
            this.preferences = api.data.sn_record_list_data_broker.out?.tableMetadata?.preferences || [];
            this.columnDefinitions = api.data.sn_record_list_data_broker.out?.columnDefinitions || { columns: [] };
            this.enableColumnCalculations = this.isColumnCalculationsEnabled(api);
        };

        getColumnOrderPrefName = () => {
            // server will decide if the list save sys_user_preference to store personalized column order or not,
            return this.table && this.preferences.find(pref => pref.name.includes(`list.columnOrder.${this.table}.`))?.name;
        };

        saveColumnOrderUserPref = (value) => {
            const name = this.getColumnOrderPrefName();
            if (name)
                this.api.data.save_user_preference.execute({ name, value });
            else
                console.warn('Could not save column order, no listId, pageId or columnPreferenceKey could be determined');
        };

        getColumnWidthsPrefName = () => {
            return this.getColumnWidthsPref()?.name;
        };

        getColumnWidthsPref = () => {
            const pref = this.table && this.preferences.find(pref => pref.name.includes(`list.columnWidths.${this.table}.`));
            if (!pref)
                console.warn('Could not save column widths, pageId or columnPreferenceKey could be determined');
            return pref;
        };

        isColumnWidthsPersonalized = () => {
            const pref = this.getColumnWidthsPref();
            return pref?.value && pref?.value !== '{}';
        };

        saveColumnWidthsUserPref = (value) => {
            const name = this.getColumnWidthsPrefName();
            if (name)
                this.api.data.save_user_preference.execute({ name, value });
            else
                console.warn('[List Bundle] saveColumnWidthsUserPref cannot save column widths to user preferences due to missing name');
        };

        saveColumnPinningUserPref = (value) => {
            const name = this.getColumnPinningPrefName();
            if (name) {
                this.api.data.save_user_preference.execute({ name, value });
            }
            else
                console.warn('[List Bundle] cannot save column pinning info to user preferences due to missing name');
        };

        getColumnPinningPrefName = () => {
            return this.getColumnPinningPref()?.name;
        };

        getColumnPinningPref = () => {
            const pref = this.table && this.preferences.find(pref => pref.name.includes(`list.columnPinningInfo.${this.table}.`));
            if (!pref)
                console.warn('Could not get column pinning info');
            return pref;
        };

        getColumnAggregatesPrefName = () => {
            return this.table && this.preferences.find(pref => pref.name.includes(`list.columnAggregates.${this.table}.`))?.name;
        };

        getColumnAggregatesPrefValue = () => {
            return this.table && this.preferences.find(pref => pref.name.includes(`list.columnAggregates.${this.table}.`))?.value;
        };

        saveColumnAggregatesUserPref = (value) => {
            const name = this.getColumnAggregatesPrefName();
            if (name)
                this.api.data.save_user_preference.execute({ name, value });
        };

        saveColumnPreferences = (preferences) => {
            this.api.data.save_user_preferences.execute({ preferences });
        };

        isColumnCalculationsEnabled = (api) => {
            const { selectedListMenuItem } = api.data.sn_record_list_data_broker.out.listMenuModel || {};
            const columns = selectedListMenuItem?.columns || api.context.props.columns;
            const { columnLimit } = api.context.props;
            const liveUpdates = api.data.sn_record_list_data_broker.out?.liveUpdates || 'off';
            const enableInfiniteScroll = api.data.sn_record_list_data_broker.out?.enableInfiniteScroll;
            const nestBy = api.context.props.nestBy;

            // If the user lacks the personalize list role, enableColumnCalculations is false from data broker output.
            // When both view and column limit are set, keep enableColumnCalculations true if enabled, so that aggregate preferences can be updated.
            // Otherwise, aggregates reappear when columns are removed and re-added.
            if (!columns && columnLimit > 0) {
                return liveUpdates === 'off' && !enableInfiniteScroll && !nestBy && api.context.props.enableColumnCalculations != false;
            }

            return api.data.sn_record_list_data_broker.out?.enableColumnCalculations;
        };

        getColumnOrderDependentPreferences = (newColumnOrder) => {
            const preferences = [];
            // Fix: Empty string split returns [''] instead of []. Check length to ensure we get empty array for empty/null/undefined values.
            const newColumns = (newColumnOrder && newColumnOrder.length > 0) ? newColumnOrder.split(",") : [];
            if (this.enableColumnCalculations) {
                const { selectedListMenuItem } = this.api.data.sn_record_list_data_broker.out.listMenuModel || {};
                const columns = selectedListMenuItem?.columns || this.api.context.props.columns;
                const { columnLimit } = this.api.context.props;
                const isViewWithColumnLimit = !columns && columnLimit > 0;
                const EMPTY_USER_PREF_VALUE = '';
                const EMPTY_AGG_VALUE = '{}';

                // When column limit & view are present,
                // on reset all column settings or reset to column defaults, to ensure that aggregates are read from sys_ui_list record '' is used as value instead of '{}'.
                const defaultNewPreferenceValue = isViewWithColumnLimit && !newColumnOrder ? EMPTY_USER_PREF_VALUE : EMPTY_AGG_VALUE;
                const newPreferenceValue = this.hasSomeColumnAggregatesSelected(newColumns) ? this.getColumnAggregatesPreference(newColumns) : defaultNewPreferenceValue;

                const defaultOldPreferenceValue = isViewWithColumnLimit ? EMPTY_USER_PREF_VALUE : EMPTY_AGG_VALUE;
                const oldPreferenceValue = this.getColumnAggregatesPrefValue() || defaultOldPreferenceValue;

                if (this.hasAggregatesPreferenceChanged(oldPreferenceValue, newPreferenceValue))
                    preferences.push({name: this.getColumnAggregatesPrefName(), value: newPreferenceValue});
            }
            // Include updated column widths to pass server-side validation
            // Server checks for exact key match between columns and widths
            const widthsPref = this.getUpdatedColumnWidthsPreference(newColumns);
            if (widthsPref)
                preferences.push(widthsPref);
            return preferences;
        }

        getUpdatedColumnWidthsPreference = (newColumns) => {
            const name = this.getColumnWidthsPrefName();
            if (!name)
                return null;

            const currentWidthsPref = this.getColumnWidthsPref();
            const hasExistingWidths = currentWidthsPref?.value && currentWidthsPref.value !== '{}';
            const existingWidths = hasExistingWidths ? JSON.parse(currentWidthsPref.value) : {};
            const newWidths = {};

            // Only preserve widths for columns that have actual values (not empty strings)
            // Empty strings indicate columns that were never explicitly modified by the user
            newColumns.forEach(columnKey => {
                const existingWidth = existingWidths[columnKey];
                // Only include if width exists AND is not an empty string
                if (existingWidth && existingWidth !== '') {
                    newWidths[columnKey] = existingWidth;
                }
                // If no width or empty string, don't add to newWidths - only save modified columns
            });

            // Check if widths have actually changed
            const existingKeys = Object.keys(existingWidths);
            const newKeys = Object.keys(newWidths);
            const widthsChanged = existingKeys.length !== newKeys.length ||
                newKeys.some(key => existingWidths[key] !== newWidths[key]);

            // Only return preference if we have widths and they've changed
            return (newKeys.length > 0 && widthsChanged) ? { name, value: JSON.stringify(newWidths) } : null;
        }

        hasAggregatesPreferenceChanged = (oldPref, newPref) => {
            if (!oldPref || !newPref) return oldPref !== newPref;
            try {
                const oldPrefObj = JSON.parse(oldPref);
                const newPrefObj = JSON.parse(newPref);
                // When columns are personalized, the number of columns with aggregates will either remain the same or decrease.
                // When reset all column settings is clicked, there will be no columns with aggregates. Therefore length check is sufficient.
                return Object.keys(oldPrefObj).length !== Object.keys(newPrefObj).length;
            } catch (e) {
                console.error('[List Bundle] Error parsing column aggregates preference JSON', e);
                return oldPref !== newPref;
            }
        };

        hasSomeColumnAggregatesSelected = (requiredColumns) => {
            return this.columnDefinitions.columns.some((column) => requiredColumns.includes(column.key) && column.metadata?.columnAggregatesInfo?.some((aggregate) => aggregate.isSelected));
        }

        getColumnAggregatesPreference = (requiredColumns) => {
            return JSON.stringify(this.columnDefinitions.columns.reduce((columnAggregatesMap, column) => {
                const hasSomeSelected = column.metadata?.columnAggregatesInfo?.some((aggregate) => aggregate.isSelected);
                if (requiredColumns.includes(column.key) && hasSomeSelected) {
                    columnAggregatesMap[column.key] = column.metadata?.columnAggregatesInfo.reduce((aggregates, aggregate) => {
                        aggregates[aggregate.id] = aggregate.isSelected;
                        return aggregates;
                    }, {});
                }
                return columnAggregatesMap;
            }, {}));
        }

        updatePreference = (name, value) => {
            if (!name)
                return;
            const pref = this.preferences.find(p => p.name === name);
            if (pref)
                pref.value = value;
        };

        updatePreferences = (preferences) => {
            preferences.forEach(({ name, value }) => { if(name) this.updatePreference(name, value); });
        }

        transform = ({ dataElemId, data: { output: { data } = {} } = {} }) => {
            if (!data)
                return {};
            if (dataElemId === 'list_controller__my_list__update') {
                const { columns: { value } } = data.GlideRecord_Mutation?.update_sys_ux_my_list;
                return { dataElemId, value, isColumnOrder: true };
            }
            if (dataElemId === 'save_user_preference') {
                const userPreference = data.now?.userPreference?.updateUserPreference || data.GlideLayoutDomain_Mutation?.user?.setPreference;
                if(!userPreference) return {};
                const { name, value } = userPreference;
                const isColumnOrder = !!name?.match(/list\.columnOrder\./g);
                const isColumnWidths = !!name?.match(/list\.columnWidths\./g);
                const isColumnAggregates = !!name?.match(/list\.columnAggregates\./g);
                const isColumnPinning = !!name?.match(/list\.columnPinningInfo\./g);
                if (isColumnOrder || isColumnWidths || isColumnAggregates || isColumnPinning)
                    return {
                        dataElemId,
                        name,
                        value,
                        isColumnOrder,
                        isColumnWidths,
                        isColumnAggregates,
                        isColumnPinning,
                    };
            }
            if (dataElemId === 'save_user_preferences') {
                const columnPreferences = data.GlideDomain_Mutation?.user?.setPreferences;
                return { dataElemId, columnPreferences };
            }
            return {};
        };
    };

    return {
        validateDirtyStatus,
        getListColumnPreferences: (api) => new ListColumnPreferences(api),
        getEffectiveView
    };

}
