import {
    Checkbox,
    FormControlLabel,
    FormLabel,
    TextField,
} from "@mui/material";
import { ExperimentContact } from "../Experiment.styles";
import { ExperimentsLocaleText, formatText } from "../consts";

export interface ContactOptInValue {
    agreed: boolean;
    email: string;
}

export interface ContactOptInProps {
    value: ContactOptInValue;
    onChange: (value: ContactOptInValue) => void;
    contactEmail?: string | null;
    error?: boolean;
    localeText: ExperimentsLocaleText;
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactOptIn = ({
    value,
    onChange,
    contactEmail,
    error,
    localeText,
}: ContactOptInProps) => (
    <ExperimentContact>
        <FormLabel component="legend">{localeText.contactPrompt}</FormLabel>
        <FormControlLabel
            control={
                <Checkbox
                    checked={value.agreed}
                    onChange={event =>
                        onChange({ ...value, agreed: event.target.checked })
                    }
                />
            }
            label={localeText.contactAgree}
        />
        {value.agreed &&
            (contactEmail ? (
                <p>
                    {formatText(localeText.contactUsing, {
                        email: contactEmail,
                    })}
                </p>
            ) : (
                <TextField
                    type="email"
                    label={localeText.contactEmailLabel}
                    value={value.email}
                    error={error}
                    helperText={
                        error ? localeText.contactEmailInvalid : undefined
                    }
                    onChange={event =>
                        onChange({ ...value, email: event.target.value })
                    }
                    autoComplete="email"
                    required
                    fullWidth
                />
            ))}
    </ExperimentContact>
);

export default ContactOptIn;
