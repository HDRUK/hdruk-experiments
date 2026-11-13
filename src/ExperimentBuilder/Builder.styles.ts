import { FormControlLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { focusRing, radius, stroke } from "../internal/theme";

const name = "HdrukExperimentBuilder";

export const BuilderRoot = styled("div", { name, slot: "Root" })(
    ({ theme }) => ({
        display: "grid",
        gap: theme.spacing(2),
        gridTemplateColumns: "1fr",
        alignItems: "start",
        [theme.breakpoints.up("lg")]: {
            gridTemplateColumns: "1fr 2fr 1.25fr",
        },
    })
);

export const BuilderPanel = styled("section", { name, slot: "Panel" })(
    ({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        minWidth: 0,
        padding: theme.spacing(2),
        border: `${stroke.thin}px solid ${theme.palette.divider}`,
        borderRadius: radius(theme, 2),
        backgroundColor: theme.palette.background.paper,
    })
);

export const BuilderPanelTitle = styled("h2", { name, slot: "PanelTitle" })(
    ({ theme }) => ({
        ...theme.typography.h6,
        margin: 0,
    })
);

export const BuilderList = styled("ul", { name, slot: "List" })(
    ({ theme }) => ({
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(0.5),
    })
);

export const BuilderStepGroup = styled("div", { name, slot: "StepGroup" })(
    ({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(0.5),
    })
);

export const BuilderBlockList = styled(BuilderList, {
    name,
    slot: "BlockList",
})(({ theme }) => ({
    paddingLeft: theme.spacing(3),
}));

interface ItemOwnerState {
    selected: boolean;
    dragging: boolean;
    invalid: boolean;
}

export const BuilderItem = styled("div", {
    name,
    slot: "Item",
    shouldForwardProp: prop => prop !== "ownerState",
})<{ ownerState: ItemOwnerState }>(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 0.5),
    border: `${stroke.thin}px solid transparent`,
    borderRadius: radius(theme),
    backgroundColor: theme.palette.background.paper,
    variants: [
        {
            props: ({ ownerState }: { ownerState: ItemOwnerState }) =>
                ownerState.selected,
            style: {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.selected,
            },
        },
        {
            props: ({ ownerState }: { ownerState: ItemOwnerState }) =>
                ownerState.dragging,
            style: {
                boxShadow: theme.shadows[2],
                position: "relative",
                zIndex: 1,
            },
        },
        {
            props: ({ ownerState }: { ownerState: ItemOwnerState }) =>
                ownerState.invalid,
            style: {
                borderColor: theme.palette.error.main,
            },
        },
    ],
}));

export const BuilderItemButton = styled("button", {
    name,
    slot: "ItemButton",
})(({ theme }) => ({
    ...theme.typography.body2,
    flex: "1 1 auto",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(0.5),
    border: 0,
    borderRadius: radius(theme),
    background: "none",
    color: "inherit",
    textAlign: "left",
    cursor: "pointer",
    "&:focus-visible": focusRing(theme),
}));

export const BuilderItemMeta = styled("span", { name, slot: "ItemMeta" })(
    ({ theme }) => ({
        ...theme.typography.caption,
        color: theme.palette.text.secondary,
    })
);

export const BuilderItemText = styled("span", { name, slot: "ItemText" })({
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

export const BuilderFields = styled("div", { name, slot: "Fields" })(
    ({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
    })
);

export const BuilderFieldRow = styled("div", { name, slot: "FieldRow" })(
    ({ theme }) => ({
        display: "flex",
        alignItems: "flex-start",
        gap: theme.spacing(1),
        "& > *": {
            flex: "1 1 0",
        },
        "& > button": {
            flex: "0 0 auto",
        },
    })
);

export const BuilderFieldset = styled("fieldset", {
    name,
    slot: "Fieldset",
})(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    margin: 0,
    padding: theme.spacing(1.5),
    border: `${stroke.thin}px solid ${theme.palette.divider}`,
    borderRadius: radius(theme),
    minWidth: 0,
}));

export const BuilderLegend = styled("legend", { name, slot: "Legend" })(
    ({ theme }) => ({
        ...theme.typography.subtitle2,
        padding: theme.spacing(0, 0.5),
    })
);

export const BuilderHelp = styled("p", { name, slot: "Help" })(({ theme }) => ({
    ...theme.typography.caption,
    margin: 0,
    color: theme.palette.text.secondary,
}));

export const BuilderPreviewFrame = styled("div", {
    name,
    slot: "PreviewFrame",
})(({ theme }) => ({
    padding: theme.spacing(3),
    border: `${stroke.thin}px dashed ${theme.palette.divider}`,
    borderRadius: radius(theme, 2),
}));

export const BuilderUploadInput = styled("input", {
    name,
    slot: "UploadInput",
})(visuallyHidden);

export const BuilderThumbnail = styled("img", { name, slot: "Thumbnail" })(
    ({ theme }) => ({
        display: "block",
        maxWidth: "100%",
        maxHeight: theme.spacing(20),
        objectFit: "contain",
        alignSelf: "flex-start",
        border: `${stroke.thin}px solid ${theme.palette.divider}`,
        borderRadius: radius(theme),
    })
);

export const BuilderActions = styled("div", { name, slot: "Actions" })(
    ({ theme }) => ({
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing(1),
    })
);

export const BuilderToggle = styled(FormControlLabel, {
    name,
    slot: "Toggle",
})(({ theme }) => ({
    margin: 0,
    gap: theme.spacing(2),
    alignSelf: "flex-start",
}));
