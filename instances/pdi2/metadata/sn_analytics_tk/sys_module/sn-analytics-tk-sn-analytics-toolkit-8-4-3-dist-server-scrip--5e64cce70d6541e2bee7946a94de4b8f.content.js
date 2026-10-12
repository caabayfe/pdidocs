import { event, VisualizationConfigurationExtractor, } from '@servicenow/glide/sn_analytics_tk';
import { Tables } from '../constants.js';
export function updateVisualizations() {
    if (event.parm1 && event.parm1.includes(Tables.PAR_VISUALIZATION)) {
        const extractor = new VisualizationConfigurationExtractor(false);
        extractor.processVisualizationsWithMissingConfiguration();
    }
}
