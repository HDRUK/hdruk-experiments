const normalise = (path: string) => {
    const [withoutQuery] = path.split(/[?#]/);
    const trimmed = withoutQuery.replace(/\/+$/, "");
    return trimmed === "" ? "/" : trimmed;
};

const escapeRegExp = (value: string) =>
    value.replace(/[.+^${}()|[\]\\]/g, "\\$&");

const patternToRegExp = (pattern: string) => {
    const source = normalise(pattern)
        .split("/")
        .map(segment => {
            if (segment === "**") {
                return "\u0000";
            }
            return escapeRegExp(segment).replace(/\*/g, "[^/]*");
        })
        .join("/")
        .replace(/\/\u0000/g, "(?:/.*)?")
        .replace(/\u0000/g, ".*");

    return new RegExp(`^${source}$`);
};

export const matchPath = (patterns: string[], pathname: string) => {
    const target = normalise(pathname);
    return patterns.some(pattern => patternToRegExp(pattern).test(target));
};
