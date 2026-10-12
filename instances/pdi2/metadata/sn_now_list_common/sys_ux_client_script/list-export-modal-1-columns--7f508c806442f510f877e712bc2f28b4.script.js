/**
      * @param {params} params
      * @param {api} params.api
      * @param {TransformApiHelpers} params.helpers
      */
    function evaluateProperty({api, helpers}) {
      const columns = api.data.controller.columnDefinitions?.columns ?? [];
      let columnNames = columns.map((column) => {
          return column.key;
      })
      return columnNames.join(',');
    }
