import { createTheme } from "@mui/material/styles";
import colors from "./base/colors";
import typography from "./base/typography";
import boxShadows from "./base/boxShadows";
import borders from "./base/borders";
import card from "./components/card";

import boxShadow from "./functions/boxShadow";
import hexToRgb from "./functions/hexToRgb";
import linearGradient from "./functions/linearGradient";
import pxToRem from "./functions/pxToRem";
import rgba from "./functions/rgba";

declare module "@mui/material/styles" {
    interface Theme {
        boxShadows: any; // Using any for simplicity now
        borders: any;
        functions: any;
    }
    interface ThemeOptions {
        boxShadows?: any;
        borders?: any;
        functions?: any;
    }
}

export default createTheme({
    palette: { ...(colors as any) },
    typography: { ...typography },
    breakpoints: {
        values: {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
        },
    },
    // shadows: ...boxShadows, // Don't override standard shadows with object
    // We need to map named shadows to the array or just ignore type error for custom shadows?
    // MUI expects shadows to be an array. Material Dashboard uses custom `boxShadows` object.
    // We should probably keep `shadows` as default MUI array and add `boxShadows` as custom property.
    // But `createTheme` allows adding custom properties.

    // Custom properties
    boxShadows: { ...boxShadows },
    borders: { ...borders },
    functions: {
        boxShadow,
        hexToRgb,
        linearGradient,
        pxToRem,
        rgba,
    },

    components: {
        MuiCard: { ...card },
    },
});
