/** Stable in-page anchor for the nth block of a tract (shared by reader and search). */
export const blockAnchor = (index: number): string => `p${index + 1}`;
