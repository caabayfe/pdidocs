function onLoad() {
    var isAgenticPlaybookEnabled = g_scratchpad.enableAgenticPlaybook === 'true' ? true : false;

    // Hide AI Agents tab if Agentic playbook plugin is disabled
    if (!isAgenticPlaybookEnabled) {
        g_form.setVisible('ai_agent_field_display_preferences', false);

        var onRadio = document.querySelector('input[name="sys_pd_activity_definition.enable_ai_agent"][value="on"]');
        var offRadio = document.querySelector('input[name="sys_pd_activity_definition.enable_ai_agent"][value="off"]');

        // Simulate a user click on the "Off" radio button to disable AI Agents
        if (onRadio && offRadio) {
            offRadio.click();
        }

        var tabs = document.querySelectorAll('.tabs2_tab');

        // Focus on first tab
        if (tabs.length > 0) {
            tabs[0].click();
        }

        var TAB_LABEL = 'AI Agents';

        // Hide the "AI Agents" tab header
        tabs.forEach(function(tab) {
            var label = tab.querySelector('.tab_caption_text');
            if (label && label.textContent && label.textContent.trim() === TAB_LABEL) {
                tab.closest('.tab_header').style.display = 'none';
            }
        });

        // Hide the "AI Agents" section content
        document.querySelectorAll('.tabs2_section').forEach(section => {
            if (section.getAttribute('tab_caption') === TAB_LABEL) {
                section.style.display = 'none';
            }
        });
    }
}
