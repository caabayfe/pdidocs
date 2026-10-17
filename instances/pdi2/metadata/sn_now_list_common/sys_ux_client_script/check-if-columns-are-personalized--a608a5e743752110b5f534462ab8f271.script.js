function script({ api, event, helpers, imports }) {

      const { 
        listId,
        columnLimit, 
        menuSelection = [],
        relatedListName,
        parentTable
      } =  api.context.props;

      const { table, tableMetadata, listMenuModel = {} } = api.data.sn_record_list_data_broker.out;
      const { selectedListMenuItem } = listMenuModel;
      const { targetTable } = selectedListMenuItem || {};
      const columns = selectedListMenuItem?.columns || api.context.props.columns;
      const { getListColumnPreferences } = imports['sn_now_list_common.ListControllerUtils']();
      const helper = getListColumnPreferences(api);
      
      api.setState('areColumnWidthsPersonalized', helper.isColumnWidthsPersonalized());

      // if list is a "my list" the columdOrder preference is attached to the listId
      if (listId && targetTable === 'sys_ux_my_list' && columns) {
        api.setState('areColumnsPersonalized', false);

      // if this list has column or columnLimit properties set
      // then the columnOrder is saved in the user preference
      } else if (columns || columnLimit > 0) {
        const columnOrderPreference = tableMetadata?.preferences?.find(x => x.name.includes('columnOrder'));
        api.setState('areColumnsPersonalized', Boolean(columnOrderPreference?.value));

      // if neither of the above conditions are true, columnOrder prefernce is saved
      // and retrieved through column personalization (UI16 method, stored in sys_ui_list record by table/view/user)
      } else {
        const { getEffectiveView } = imports['sn_now_list_common.ListControllerUtils']();
        let view = getEffectiveView(api);
        const relationshipId = relatedListName?.startsWith('REL:')
          ? relatedListName
          : '';
        const queryParams = [
          `sysparm_view=${view || ''}`,
          `sysparm_parent_table=${parentTable || ''}`,
          `sysparm_relationship_id=${relationshipId}`,
        ].join('&');
        helpers
          .snHttp(
            `/api/now/ui/personalize_columns/${table}?${queryParams}`,
            {
              method: 'GET'
            }
          )
          .then(({ response }) => { 
            api.setState('areColumnsPersonalized', response.result);
          })
          .catch(({ error }) => {
            console.log(error);
          });
      }
}
