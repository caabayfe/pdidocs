/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var dashboardText = await helpers.translate('Dashboards');
    var vizText = await helpers.translate('Visualizations');
    var reportText = await helpers.translate("Reports");
    var items = JSON.parse(event.payload.cellContext.row.metadata.export_items.value);
    var dashboardItems = "";
    var dashboardHeader = "";
    if (items.dashboards && items.dashboards.length > 0) {
        dashboardHeader = '<div class="heading" tabindex="0">'+dashboardText+'</div>';
        for (var i = 0; i < items.dashboards.length; i++) {
            dashboardItems = dashboardItems + '<now-text-link class="textlink" underlined opens-window size="md" label="' + items.dashboards[i].name + '" href="now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/' + items.dashboards[i].id + '" variant="primary"></now-text-link><br> \n';
        }
    }
 
    var vizItems = "";
    var vizHeader = "";
    if (items.visualizations && items.visualizations.length > 0) {
        for (var i = 0; i < items.visualizations.length; i++) {
            vizItems = vizItems + '<now-text-link class="textlink" underlined opens-window size="md" label="' + items.visualizations[i].name + '" href="now/platform-analytics-workspace/visualization-designer/' + items.visualizations[i].id + '" variant="primary"></now-text-link><br> \n';
        }
        if (items.dashboards.length > 0)
            vizHeader = '<div class="viz-heading" tabindex="0">'+vizText+'</div>';
        else
            vizHeader = '<div class="heading" tabindex="0">'+vizText+'</div>';
    }

    var reportItems = "";
    var reportHeader = "";
    if(items.reports && items.reports.length > 0) {
      for (var i = 0; i < items.reports.length; i++){
        reportItems = reportItems + '<now-text-link class="textlink" underlined opens-window size="md" label="' + items.reports[i].name + '"href="/now/nav/ui/classic/params/target/sys_report_template.do%3Fjvar_report_id%3D' + items.reports[i].id + '" variant="primary"></now-text-link><br> \n';
      }
      reportHeader = '<div class="heading" tabindex="0">'+reportText+'</div>';
    }
    var html = `
  <html>
      <head>
        <style>
          .heading{
            font-size: 1.17em;
            font-weight: 600; 
            margin-bottom: 4px;
          }
          .viz-heading{
            font-size: 1.17em;
            font-weight: 600; 
            margin-bottom: 4px;
            margin-top: 8px;
          }
          .textlink{
            font-size: 14px;
          }
        </style>
      </head>
      
      <body>
      <div>
      ` + dashboardHeader + '\n' + dashboardItems + `
      </div>
      <div>
      ` + vizHeader + '\n' + vizItems + `
      </div>
      <div>
        ` + reportHeader + `\n` + reportItems + `
      </div>
      </body>
    </html>
  `;
    api.setState("modalContent", html);
    helpers.modal.open("summary");
}
