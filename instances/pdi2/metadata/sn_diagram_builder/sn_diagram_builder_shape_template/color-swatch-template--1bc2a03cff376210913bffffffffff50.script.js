function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    const COLORS = {
        Blue: "#A0E4EF",
        Brown: "#F4E9DD",
        Green: "#D4EED8",
        Magenta: "#F9DAEF",
        Orange: "#FFE2DC",
        Teal: "#D4F0F0",
        Yellow: "#FFF1D4"
    };

    function swatch(hex, label) {
        return $("Button", {
                name: label,
                click: (e, obj) => {
                    const node = obj.part && obj.part.adornedPart;
                    if (!node) return;
                    e.diagram.model.commit(m => {
                        m.set(node.data, "background", hex);
                    });
                },
                "ButtonBorder.fill": hex,
                "ButtonBorder.stroke": hex,
                "_buttonFillOver": hex,
                width: 20,
                height: 20,
                margin: new go.Margin(0, 3, 3, 0),
                toolTip: $(go.Adornment, "Auto", $(go.Shape, "RoundedRectangle", {
                        fill: "black"
                    }),
                    $(go.TextBlock, label, {
                        margin: 2,
                        stroke: "white",
                        font: "12px sans-serif"
                    })),

            },
            new go.Binding("ButtonBorder.stroke", "currentFocusOn", (currentFocusOn, obj) => {
                return (currentFocusOn === label) ? resolveThemeVariable('--now-color--primary-1') : hex;
            }),
        );
    }

    const swatchButtons = Object.entries(COLORS).map(([label, hex]) => swatch(hex, label));
    return swatchButtons;
}
