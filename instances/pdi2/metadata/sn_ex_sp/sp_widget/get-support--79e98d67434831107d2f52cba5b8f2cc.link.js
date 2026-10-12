function link(scope, element, attrs, controller) {
    $(document).ready(function() {
        var staticContent = document.getElementsByClassName('static');

        for (var i = 0; i < staticContent.length; i++) {
            var staticContentRect = staticContent[i].getBoundingClientRect();
            var contentLeft = staticContentRect.left;
            var contentRight = staticContentRect.right;
            var contentTop = staticContentRect.top;
            var contentBottom = staticContentRect.bottom;
            var aTag = staticContent[i].getElementsByTagName("a");
            for (var j = 0; j < aTag.length; j++) {

                var aRect = aTag[j].getBoundingClientRect();
                var aLeft = aRect.left;
                var aRight = aRect.right;
                var aTop = aRect.top;
                var aBottom = aRect.bottom;
                if (!(aLeft >= contentLeft && aRight <= contentRight && aTop >= contentTop && aBottom <= contentBottom))
                    aTag[j].tabIndex = -1;

            }


        }
    });
}
