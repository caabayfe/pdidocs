function script({
    api,
    event,
    imports
}) {
    const { listIdUpdateFromMenuClick } = api.state;
    const { name, value } = event.payload;

    const updatelistColumnsTarget = () => {
        const { listColumnsTarget } = api.state;
        const targetTable = value && listColumnsTarget !== 'sys_user_preference' && 'sys_user_preference' ||
                            !value && listColumnsTarget !== 'sys_ui_list' && 'sys_ui_list' || null;
        if (targetTable) {
            const isColumnLimit = name === 'columnLimit';
            if (isColumnLimit && listColumnsTarget && api.state.columns) {
                api.setState('columns', '', false);
                if (api.state.ignoreColumnPreferences === true)
                    api.setState('ignoreColumnPreferences', false, false);
            };
            api.setState('listColumnsTarget', targetTable, false);
        }
    };

    if ((name === 'columnLimit' && !api.context.props.columns) || (name === 'columns' && !api.context.props.columnLimit) 
                && api.context.props.listType !== 'withMenu' && !!value !== !!previousValue)
        updatelistColumnsTarget();
    else if (name === 'listId') {
        //always set this to false so next macroponent prop change will redetermine who (browser back/forward or menu click) initiated this prop change.
         api.setState('listIdUpdateFromMenuClick', false, false);
         if (!listIdUpdateFromMenuClick) {
               api.emit('LIST_CTRL#MENU_ITEM_CLICKED', { selectedItem: { id: value }, menuClickFromBrowserNav: true, isPrimaryClick: true });
         }
    }

    const propsInState = [
        'rowLimit',
        'filter',
        'currentPage',
        'table',
        'columns',
        'columnLimit',
        'view',
        'listTitle',
        'fetchHighlightedValues',
        'fixedFilter',
        'groupBy',
        'enableCellFiltering',
        'enableColumnFiltering'
    ];

    const propsNeedResetRowSelection = [
        'filter',
        'groupBy',
        'fixedFilter',
        'table',
        'columns'
    ];

    if(propsNeedResetRowSelection.includes(name)) {
        api.data.sn_record_list_data_broker.resetRowSelection();
    }

    if (propsInState.includes(name)) {
        // Whenever prop change happens to trigger a data fetch, reset childQuery to empty string
        api.setState('childQuery','');
        if (name === 'filter' || name === 'groupBy') {
            api.setState('query', value);
            return;
        }
        if (name === 'fixedFilter') {
            api.setState('fixedQuery', value);
            return;
        }
        api.setState(name, value);
    }
}
