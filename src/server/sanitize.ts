import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Translation/Tafsir HTML comes from a third party. Only harmless formatting
 * tags survive; every attribute (incl. event handlers, styles, links) is dropped.
 */
const RICH: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "b", "strong", "i", "em", "sup", "sub", "span", "h2", "h3", "h4", "ul", "ol", "li", "blockquote"],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
  // Strip contents of script/style entirely rather than unwrapping them.
  nonTextTags: ["script", "style", "textarea", "noscript", "iframe", "object"],
};

const INLINE: sanitizeHtml.IOptions = {
  ...RICH,
  allowedTags: ["b", "strong", "i", "em", "sup", "sub", "span"],
};

export const sanitizeRich = (html: string) => sanitizeHtml(html, RICH).trim();
export const sanitizeInline = (html: string) => sanitizeHtml(html, INLINE).trim();
export const stripTags = (html: string) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
