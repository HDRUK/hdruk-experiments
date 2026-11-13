import { Theme } from "@mui/material/styles";

export const stroke = { thin: 1, medium: 2, thick: 3 };

export const radius = (theme: Theme, multiple = 1) =>
    Number(theme.shape.borderRadius) * multiple;

type FocusPalette = Theme["palette"] & {
    status?: { keyboardFocus?: string };
};

export const focusRing = (theme: Theme) => {
    const { status, primary } = theme.palette as FocusPalette;

    return {
        outline: `${stroke.thick}px solid ${
            (status && status.keyboardFocus) || primary.main
        }`,
        outlineOffset: stroke.medium,
    };
};
