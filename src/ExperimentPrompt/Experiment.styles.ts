import RadioGroup from "@mui/material/RadioGroup";
import Rating, { ratingClasses } from "@mui/material/Rating";
import { Theme, styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { focusRing, radius, stroke } from "../internal/theme";

const name = "HdrukExperiment";

export const ExperimentFormRoot = styled("form", { name, slot: "Root" })(
    ({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(3),
    })
);

export const ExperimentStepTitle = styled("h3", { name, slot: "StepTitle" })(
    ({ theme }) => ({
        ...theme.typography.h4,
        margin: 0,
        paddingRight: theme.spacing(5),
    })
);

export const ExperimentHeading = styled("h3", { name, slot: "Heading" })(
    ({ theme }) => ({
        ...theme.typography.h5,
        margin: 0,
    })
);

export const ExperimentRichText = styled("div", { name, slot: "RichText" })(
    ({ theme }) => ({
        ...theme.typography.body1,
        "& .ProseMirror": {
            outline: "none",
        },
        "& p": {
            margin: 0,
        },
        "& p + p": {
            marginTop: theme.spacing(1),
        },
    })
);

export const ExperimentNotice = styled("aside", { name, slot: "Notice" })(
    ({ theme }) => ({
        ...theme.typography.body2,
        borderLeft: `${stroke.thick}px solid ${theme.palette.primary.main}`,
        padding: theme.spacing(1, 2),
    })
);

export const ExperimentFigure = styled("figure", { name, slot: "Figure" })(
    ({ theme }) => ({
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(1),
    })
);

export const ExperimentImage = styled("img", { name, slot: "Image" })(
    ({ theme }) => ({
        display: "block",
        maxWidth: "100%",
        height: "auto",
        borderRadius: radius(theme),
    })
);

export const ExperimentCaption = styled("figcaption", {
    name,
    slot: "Caption",
})(({ theme }) => ({
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
}));

export const ExperimentQuestionBody = styled("div", {
    name,
    slot: "QuestionBody",
})(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

export const ExperimentTextQuestion = styled("div", {
    name,
    slot: "TextQuestion",
})(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

export const ExperimentReason = styled(ExperimentTextQuestion, {
    name,
    slot: "Reason",
})(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const ExperimentFaces = styled("div", { name, slot: "Faces" })(
    ({ theme }) => ({
        display: "flex",
        justifyContent: "space-between",
        gap: theme.spacing(1),
    })
);

export const ExperimentRatingControl = styled("div", {
    name,
    slot: "RatingControl",
})({
    display: "flex",
    flexDirection: "column",
});

export const ExperimentStars = styled(Rating, { name, slot: "Stars" })(
    ({ theme }) => ({
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        gap: theme.spacing(1),
        [`& > .${ratingClasses.label}:last-child`]: {
            position: "absolute",
        },
        [`& .${ratingClasses.icon}`]: {
            padding: theme.spacing(0.5),
        },
    })
);

export const ExperimentScale = styled("div", { name, slot: "Scale" })(
    ({ theme }) => ({
        display: "flex",
        gap: theme.spacing(0.5),
    })
);

interface SelectedOwnerState {
    selected: boolean;
    focusVisible: boolean;
}

const focusVisibleVariant = (theme: Theme) => ({
    props: ({ ownerState }: { ownerState: SelectedOwnerState }) =>
        ownerState.focusVisible,
    style: focusRing(theme),
});

export const ExperimentScalePoint = styled("label", {
    name,
    slot: "ScalePoint",
    shouldForwardProp: prop => prop !== "ownerState",
})<{ ownerState: SelectedOwnerState }>(({ theme }) => ({
    ...theme.typography.body2,
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.spacing(5),
    border: `${stroke.thin}px solid ${theme.palette.divider}`,
    borderRadius: radius(theme),
    cursor: "pointer",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    variants: [
        {
            props: ({ ownerState }: { ownerState: SelectedOwnerState }) =>
                ownerState.selected,
            style: {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                },
            },
        },
        focusVisibleVariant(theme),
    ],
}));

export const ExperimentFacePoint = styled("label", {
    name,
    slot: "FacePoint",
    shouldForwardProp: prop => prop !== "ownerState",
})<{ ownerState: SelectedOwnerState }>(({ theme }) => ({
    display: "inline-flex",
    padding: theme.spacing(0.5),
    borderRadius: radius(theme, 6),
    color: theme.palette.text.secondary,
    cursor: "pointer",
    "&:hover": {
        color: theme.palette.primary.main,
    },
    variants: [
        {
            props: ({ ownerState }: { ownerState: SelectedOwnerState }) =>
                ownerState.selected,
            style: {
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                    color: theme.palette.primary.contrastText,
                },
            },
        },
        focusVisibleVariant(theme),
    ],
}));

export const ExperimentHiddenInput = styled("input", {
    name,
    slot: "HiddenInput",
})(visuallyHidden);

export const ExperimentScaleLabels = styled("div", {
    name,
    slot: "ScaleLabels",
})(({ theme }) => ({
    ...theme.typography.caption,
    display: "flex",
    justifyContent: "space-between",
    color: theme.palette.text.secondary,
}));

export const ExperimentAbOptions = styled(RadioGroup, {
    name,
    slot: "AbOptions",
})(({ theme }) => ({
    display: "grid",
    gap: theme.spacing(2),
    gridTemplateColumns: "1fr",
    [theme.breakpoints.up("sm")]: {
        gridTemplateColumns: "1fr 1fr",
    },
}));

export const ExperimentAbOption = styled("div", {
    name,
    slot: "AbOption",
    shouldForwardProp: prop => prop !== "ownerState",
})<{ ownerState: SelectedOwnerState }>(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    border: `${stroke.thin}px solid ${theme.palette.divider}`,
    borderRadius: radius(theme, 2),
    variants: [
        {
            props: ({ ownerState }: { ownerState: SelectedOwnerState }) =>
                ownerState.selected,
            style: {
                borderColor: theme.palette.primary.main,
                boxShadow: `inset 0 0 0 ${stroke.thin}px ${theme.palette.primary.main}`,
            },
        },
        focusVisibleVariant(theme),
    ],
}));

export const ExperimentAbOptionLabel = styled("label", {
    name,
    slot: "AbOptionLabel",
})(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    alignSelf: "stretch",
    cursor: "pointer",
}));

export const ExperimentAbOptionTitle = styled("span", {
    name,
    slot: "AbOptionTitle",
})(({ theme }) => ({
    ...theme.typography.body1,
    display: "flex",
    alignItems: "center",
}));

export const ExperimentActions = styled("div", { name, slot: "Actions" })(
    ({ theme }) => ({
        display: "flex",
        justifyContent: "space-between",
        gap: theme.spacing(1),
        "& > :only-child": {
            marginLeft: "auto",
        },
    })
);

export const ExperimentDialogClose = styled("div", {
    name,
    slot: "DialogClose",
})(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

export const ExperimentDialogLabel = styled("h2", {
    name,
    slot: "DialogLabel",
})(visuallyHidden);

export const ExperimentThankYou = styled("div", { name, slot: "ThankYou" })(
    ({ theme }) => ({
        ...theme.typography.body1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(2),
        padding: theme.spacing(2, 0),
        textAlign: "center",
    })
);

export const ExperimentContact = styled("fieldset", { name, slot: "Contact" })(
    ({ theme }) => ({
        border: 0,
        margin: 0,
        padding: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: theme.spacing(1.5),
        width: "100%",
    })
);

export const ExperimentThankYouBody = styled("div", {
    name,
    slot: "ThankYouBody",
})(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    "& p": {
        margin: 0,
    },
}));

export const ExperimentThankYouTitle = styled("p", {
    name,
    slot: "ThankYouTitle",
})(({ theme }) => ({
    ...theme.typography.h4,
    margin: 0,
}));
