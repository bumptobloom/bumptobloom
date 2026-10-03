import 'server-only';

import { createOpenAIClient } from './openai-client';

// gpt-4.1-mini cannot be used here. It is listed under the web search
// guide's Limitations as one of the older Responses API models, and it
// rejects the hosted tool's newer controls outright:
// "400 Parameter 'filters' not supported with model 'gpt-4.1-mini'".
// Since the allowlist below is enforced through filters.allowed_domains,
// the model and the filter are a package -- do not move this back to a
// 4.1 model without removing the filter, which would unenforce the
// allowlist again.
const RESEARCH_MODEL = 'gpt-6-luna';

/**
 * The only sites Ask is allowed to research from or cite.
 *
 * This list has existed since the file was written but was never wired to
 * anything: it was declared, the prompt below said "the allowed domains"
 * without ever naming them, and nothing filtered what came back. Ask ran an
 * unrestricted web search and showed parents up to five citations from
 * wherever it landed. For a product that answers questions about an infant's
 * health, an uncited blog shown under our name is the worst kind of bug --
 * it looks exactly like the vetted version.
 *
 * It is now enforced in three places, deliberately:
 *   1. filters.allowed_domains on the search tool, so the research model
 *      cannot read anything else in the first place. This is the one that
 *      matters, because research.summary is fed to the answering model as
 *      evidence -- filtering only the displayed citations would hide the
 *      provenance of an answer while still giving the parent the answer.
 *   2. the prompt, which now names the domains instead of referring to a list
 *      the model was never shown.
 *   3. a hostname check on every source before it is displayed or stored, in
 *      case the API ever returns something outside the filter.
 */
const ALLOWED_DOMAINS = [
  'cdc.gov',
  'healthychildren.org',
  'who.int',
  'nhs.uk',
  'nih.gov',
  'pubmed.ncbi.nlm.nih.gov',
  'unicef.org',
  'zerotothree.org',
];

export interface AskSource {
  title: string;
  url: string;
}

export interface AskResearchResult {
  summary: string;
  sources: AskSource[];
}

/**
 * True when the URL's host is an allowed domain or a subdomain of one.
 *
 * The suffix check is on a dot-prefixed host so "notcdc.gov" cannot pass as a
 * subdomain of "cdc.gov". Anything unparseable is rejected rather than shown.
 */
function isAllowedSourceUrl(url: string): boolean {
  let hostname: string;

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return false;
  }

  return ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

export async function researchAskQuestion(
  question: string,
): Promise<AskResearchResult> {
  const openai = createOpenAIClient();

  const response = await openai.responses.create({
    model: RESEARCH_MODEL,
    // Explicit, and low. This is a lookup that feeds another model, not an
    // investigation, and the client that calls it gives up after 15s
    // (docs/API-CONTRACTS.md). A higher effort turns the search agentic and
    // spends that budget thinking.
    reasoning: { effort: 'low' },
    tools: [
      {
        type: 'web_search',
        filters: {
          // Subdomains of these are allowed by the API as well, which is what
          // we want: www.cdc.gov and pubmed.ncbi.nlm.nih.gov both resolve.
          allowed_domains: ALLOWED_DOMAINS,
        },
      },
    ],
    tool_choice: 'required',
    include: ['web_search_call.action.sources'],
    input: [
      'Research the following parenting/development question using the web.',
      'You can only search these sources, and they are all authoritative:',
      ALLOWED_DOMAINS.map((domain) => `  - ${domain}`).join('\n'),
      'If they do not cover the question, say so plainly in the summary rather',
      'than filling the gap from memory.',
      'Return a concise evidence summary that another model can use to answer the parent.',
      'Do not diagnose medical conditions or recommend medication or treatment.',
      '',
      `Question: ${question}`,
    ].join('\n'),
  });

  const sources: AskSource[] = [];

  for (const item of response.output) {
    if (item.type !== 'web_search_call') {
      continue;
    }

    const action = item.action;

    if (action.type !== 'search' || !action.sources) {
      continue;
    }

    for (const source of action.sources) {
      if (!source.url) {
        continue;
      }

      // Belt and braces behind filters.allowed_domains above. A source that
      // gets this far and is not on the list is dropped silently: there is no
      // design for a "we found something we won't show you" state, and the
      // parent still gets the answer and the sources that did pass.
      if (!isAllowedSourceUrl(source.url)) {
        continue;
      }

      if (
        sources.some((existingSource) => existingSource.url === source.url)
      ) {
        continue;
      }

      let title = source.url;

      try {
        title = new URL(source.url).hostname.replace(/^www\./, '');
      } catch {
        // Keep the URL as the fallback label if it cannot be parsed.
      }

      sources.push({
        title,
        url: source.url,
      });
    }
  }

  return {
    summary: response.output_text,
    sources: sources.slice(0, 5),
  };
}
