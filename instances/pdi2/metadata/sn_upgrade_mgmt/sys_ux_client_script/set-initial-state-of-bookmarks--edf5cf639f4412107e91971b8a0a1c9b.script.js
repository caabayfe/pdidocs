/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    try {
        const bookmarks = api.data.look_up_multiple_records_1.results;
        const docUrls = ['atf-tg-cr-intro', 'c_SystemClone', 'um-upgrade-history-tool', 'um-upgrade-monitor-tool', 'um-upgrade-preview-tool', 'um-skipped-rules-tool', 'um-upgrade-plans-tool'];
        const urls = {};
        bookmarks.forEach(el => {
            urls[el.url.value] = el.sys_id.value;
        });  
        const initialState = [{
            "favouritesIcon": "console",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[0]}`,
            "bodyText": "Track data created by running tests and rolls back changes after testing.",
            "sys_id": urls?.[api?.state?.testGeneratorUrl],
            "headerText": "Automated Test Framework",
            "linkUrl": api?.state?.testGeneratorUrl
        }, {
            "favouritesIcon": "cog",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[1]}`,
            "bodyText": "Clone management provides visible clone status, removes error-prone clone submissions, and more.",
            "sys_id": urls?.["now/clone/ui/home"],
            "headerText": "Cloning",
            "linkUrl": "now/clone/ui/home"
        }, {
            "favouritesIcon": "calendar",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[2]}`,
            "bodyText": "Track all instance upgrades using the Upgrade History module, and view detailed reports for past or recent upgrade versions.",
            "sys_id": urls?.["now/nav/ui/classic/params/target/sys_upgrade_history_list.do%3Fsysparm_userpref_module%3D6c48d732c76200104e562f53a2c260dc%26sysparm_query%3Dhistory_type%253Dupgrade%255EEQ%26sysparm_clear_stack%3Dtrue"],
            "headerText": "Upgrade History",
            "linkUrl": "now/nav/ui/classic/params/target/sys_upgrade_history_list.do%3Fsysparm_userpref_module%3D6c48d732c76200104e562f53a2c260dc%26sysparm_query%3Dhistory_type%253Dupgrade%255EEQ%26sysparm_clear_stack%3Dtrue"
        }, {
            "favouritesIcon": "dashboard",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[3]}`,
            "bodyText": "Track and schedule upgrades using the Upgrade Monitor module. After completion, review the upgrade summary and check for records that caused conflicts.",
            "sys_id": urls?.["now/nav/ui/classic/params/target/%24upgrade_monitor.do%3Fsysparm_use_polaris%3Dfalse"],
            "headerText": "Upgrade Monitor",
            "linkUrl": "now/nav/ui/classic/params/target/%24upgrade_monitor.do%3Fsysparm_use_polaris%3Dfalse",
        }, {
            "favouritesIcon": "new-ticket",
            "docs_url": "https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0541128#mcetoc_1gk8jeli7j",
            "bodyText": "ServiceNow 24/7 support.",
            "sys_id": urls?.["https://support.servicenow.com"],
            "headerText": "Now Support",
            "linkUrl": "https://support.servicenow.com"
        }, {
            "favouritesIcon": "search",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[4]}`,
            "bodyText": "View upcoming system upgrades, allowing them to preview changes and assess potential impacts before the actual upgrade occurs.",
            "sys_id": urls?.["now/nav/ui/classic/params/target/%24upgrade_preview.do"],
            "headerText": "Upgrade Preview",
            "linkUrl": "now/nav/ui/classic/params/target/%24upgrade_preview.do"
        }, {
            "favouritesIcon": "edit",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[5]}`,
            "bodyText": "Review your Skipped Record Rules to execute bulk action on your skipped records across your instance",
            "sys_id": urls?.["now.com/now/nav/ui/classic/params/target/sys_upgrade_skipped_record_rule_list.do%3Fsysparm_userpref_module%3D3f5a9cd943f02110fd275cfd2bb8f2e1%26sysparm_clear_stack%3Dtrue"],
            "headerText": "Upgrade Skipped Record Rules Editor",
            "linkUrl": "now/nav/ui/classic/params/target/sys_upgrade_skipped_record_rule_list.do%3Fsysparm_userpref_module%3D3f5a9cd943f02110fd275cfd2bb8f2e1%26sysparm_clear_stack%3Dtrue"
        }, {
            "favouritesIcon": "form",
            "docs_url": `/api/now/v1/context_doc_url/${docUrls?.[6]}`,
            "bodyText": "Accelerate upgrades using the Upgrade Plan, which automates application installation for a seamless experience. Define apps and target versions to install directly on your instance.",
            "sys_id": urls?.["now/nav/ui/classic/params/target/sys_upgrade_plan_list.do%3Fsysparm_userpref_module%3D76137a9077202010277725e3681061b0%26sysparm_clear_stack%3Dtrue"],
            "headerText": "Upgrade Plans",
            "linkUrl": "now/nav/ui/classic/params/target/sys_upgrade_plan_list.do%3Fsysparm_userpref_module%3D76137a9077202010277725e3681061b0%26sysparm_clear_stack%3Dtrue"
        }];
        api.setState("toolsList", {
            toolsList: {
                output: initialState
            }
        });
        api.setState("bookmarksCount", bookmarks?.length);
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: set initial set of bookmarks", e);
    }

}
