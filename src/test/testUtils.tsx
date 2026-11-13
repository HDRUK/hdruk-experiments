import { ReactElement } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const theme = createTheme();

export const render = (ui: ReactElement, options?: RenderOptions) => ({
    user: userEvent.setup(),
    ...rtlRender(ui, {
        wrapper: ({ children }) => (
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        ),
        ...options,
    }),
});

export * from "@testing-library/react";
