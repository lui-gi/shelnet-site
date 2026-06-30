// src/components/wiki/markdown.js
// Renders wiki markdown to sanitized HTML and extracts a heading outline. The
// preprocessor swaps [[slug]] and [[slug|label]] for resolved <a> tags before
// marked runs. Header ids are stable, derived from heading text.
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function slugifyHeading(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function preprocessWikilinks(md, slugMap) {
  return md.replace(WIKILINK, (_, slug, label) => {
    const target = slugMap.get(slug.trim());
    const display = (label || slug).trim();
    if (!target) return `<span class="wikilink-broken">[[broken: ${slug.trim()}]]</span>`;
    return `<a class="wikilink" href="/wiki/${target}">${display}</a>`;
  });
}

// Configure marked once.
marked.use({
  gfm: true,
  breaks: false,
  pedantic: false,
});

export function renderMarkdown(rawMd, { slugMap }) {
  const withLinks = preprocessWikilinks(rawMd, slugMap);
  const html = marked.parse(withLinks);
  const clean = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });

  // Extract H2/H3 headings via a lexer pass on the preprocessed source.
  const headings = [];
  for (const tok of marked.lexer(withLinks)) {
    if (tok.type === 'heading' && (tok.depth === 2 || tok.depth === 3)) {
      const plain = tok.text.replace(/<[^>]*>/g, '').trim();
      headings.push({ level: tok.depth, text: plain, id: slugifyHeading(plain) });
    }
  }
  return { html: clean, headings };
}

export { slugifyHeading };
