import { html } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';

class AiuxBuilderDashboardConfig extends AIUXWidgetElement {
    createRenderRoot() {
        return this;
    }

    render() {
        return html`<aiux-dashboard-config></aiux-dashboard-config>`;
    }
}
