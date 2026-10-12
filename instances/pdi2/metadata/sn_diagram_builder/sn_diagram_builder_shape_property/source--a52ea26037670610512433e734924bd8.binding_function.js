function getBinding(go, source, target, dispatch, resolveThemeVariable, customProps) {
    return new go.Binding(target, source, function(loaderState, picture) {

        // Function to start loader animation
        function startLoaderAnimation(picture) {
            if (!picture._animation) {
                const animation = new go.Animation();
                animation.duration = customProps._inProgressRotationRateLimit; // 2 seconds for full rotation
                animation.easing = go.Animation.EaseLinear;

                animation.add(picture, "angle", 0, 360);
                animation.runCount = Infinity;
                picture._animation = animation;
                animation.start();
            }
        }

        // Function to stop loader animation
        function stopLoaderAnimation(picture) {
            if (picture._animation) {
                picture._animation.stop();
                picture._animation = null;
                // Create a fade-in animation for the new icon
                const fadeInAnimation = new go.Animation();
                fadeInAnimation.duration = 400; // Duration for fade-in 400ms
                fadeInAnimation.easing = go.Animation.EaseLinear;

                picture.opacity = 0; // Start with fully transparent

                fadeInAnimation.add(picture, "opacity", 0, 1); // Animate opacity from 0 to 1

                fadeInAnimation.start();
            }
        }

        stopLoaderAnimation(picture);

        if (loaderState == "_inProgress" && customProps.hasOwnProperty(loaderState))
            startLoaderAnimation(picture);

        return customProps[loaderState];
    });
}
