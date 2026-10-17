function onLoad() {
    function hideDeleteButtons() {
        var btns = document.querySelectorAll('.list_delete_row');
        btns.forEach(function(btn) {
            btn.style.display = 'none';
        });
    }

    window.addEventListener('load', function() {
        var observer = new MutationObserver(function() {
            hideDeleteButtons();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        hideDeleteButtons();
    });
}
