export const DEFAULT_LOCALE_TEXT = {
    next: "Next",
    back: "Back",
    submit: "Submit",
    close: "Close",
    required: "This question needs an answer",
    optional: "(optional)",
    thankYou: "Thank you for your feedback",
    submitError: "Your answers could not be sent. Please try again.",
    dialogLabel: "Feedback",
    reasonLabel: "Tell us why (optional)",
    openPrototype: "Open design in a new tab",
    chooseDesign: "Choose this design",
    chosenDesign: "Chosen",
    characterCount: "{count} of {max} characters",
    ratingValue: "{value} of {max}",
    contactPrompt: "Can we contact you about your feedback?",
    contactAgree: "Yes, contact me",
    contactEmailLabel: "Email address",
    contactEmailInvalid: "Enter a valid email address",
    contactUsing: "We will use {email}",
    contactDone: "We may be in touch about your feedback.",
};

export type ExperimentsLocaleText = typeof DEFAULT_LOCALE_TEXT;

export const formatText = (
    template: string,
    values: Record<string, string | number>
) =>
    template.replace(/\{(\w+)\}/g, (match, key) =>
        key in values ? String(values[key]) : match
    );
