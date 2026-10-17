var confirmButton = document.getElementById('confirm_archive');

confirmButton.addEventListener('click', function confirm() {
    requestArchiveProcess();
});

function requestArchiveProcess() {
    var ajax = new GlideAjax('global.ArchiveProcessContextAjax');
    ajax.addParam('sysparm_selectedProcesses', '${JS:sysparm_selectedProcesses}');
    ajax.addParam('sysparm_name', 'archiveProcessContexts');
    ajax.getXMLAnswer(function reloadPage() {
        g_navigation.reloadWindow(window);
    });
}
