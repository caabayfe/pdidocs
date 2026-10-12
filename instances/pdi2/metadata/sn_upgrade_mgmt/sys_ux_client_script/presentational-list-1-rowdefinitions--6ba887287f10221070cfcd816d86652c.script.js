/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const results = api.state.skippedTableResults;
  if (!results || !results.length) return {};

  const rows = [];

  // Priority configurations
  const PRIORITY_CONFIG = {
      '1': { color: 'critical', label: '1 - Critical' },
      '2': { color: 'high', label: '2 - High' },
      '3': { color: 'moderate', label: '3 - Moderate' },
      '4': { color: 'low', label: '4 - Low' },
      '5': { color: 'teal', label: '5 - Planning' },
      default: { color: 'gray', label: 'N/A' }
  };

  for (let i = 0; i < results.length; i++) {
    var priority = PRIORITY_CONFIG[results[i]['priority']?.value] || PRIORITY_CONFIG.default;
    var currentRow = {
      key: results[i]['sys_id'].value,
      type: 'default',
      cells: {
        name: {
          value: results[i]['file_name'].displayValue,
          label: results[i]['file_name'].displayValue,
          sys_id: results[i]['sys_id'].value
        },
        product: {
          value: results[i]['application_category'].displayValue
        },
        priority: {
          componentProps: {
            label: priority.label,
            color: priority.color
          },
          value: results[i]['priority'].displayValue
        },
        status: {
          value: results[i]['resolution'].displayValue
        },
        test: {
          value: results?.[i]?.['test_count'] > 0 ? 'Test linked' : '',
          label: results?.[i]?.['test_count'] > 0 ? 'Test linked' : '',
          sys_id: results[i]['sys_id'].value,
          file_name: results[i]['file_name'].displayValue
        },
        disposition: {
          value: results[i]['disposition'].displayValue
        },
        plugin: {
          value: results[i]['plugin'].displayValue
        }
      }
    };

    // remove test linked column in case of production
    if (api.context.props.experienceProperties?.environment?.value?.toLowerCase?.() === 'production') {
      delete currentRow.cells.test;
    }
    rows.push(currentRow);
  }

	return {
    rows: rows
  };
}
