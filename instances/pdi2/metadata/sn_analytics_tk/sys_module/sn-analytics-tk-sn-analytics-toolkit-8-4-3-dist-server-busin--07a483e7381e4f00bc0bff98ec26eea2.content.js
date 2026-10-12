import { GlideRecord } from '@servicenow/glide';
import { VisualizationConfigurationExtractor } from '@servicenow/glide/sn_analytics_tk';
import { Tables } from '../constants.js';
export function updateVisualizationConfiguration(current) {
    new VisualizationConfigurationExtractor(false).processVisualization(current.sys_id);
}
export function deleteVisualizationConfiguration(current) {
    const gr = new GlideRecord(Tables.PAR_VISUALIZATION_CONFIGURATION);
    gr.addQuery(Tables.PAR_VISUALIZATION, current.sys_id);
    gr.query();
    while (gr.next()) {
        gr.deleteRecord();
    }
}
