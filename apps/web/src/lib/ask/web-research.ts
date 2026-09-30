import 'server-only';

import { createOpenAIClient } from './openai-client';

const RESEARCH_MODEL = 'gpt-4.1-mini';

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

export async function researchAskQuestion(
  question: string,
): Promise<AskResearchResult> {
  const openai = createOpenAIClient();

  const response = await openai.responses.create({
    model: RESEARCH_MODEL,
    tools: [
      {
        type: 'web_search',
      },
    ],
    tool_choice: 'required',
    include: ['web_search_call.action.sources'],
    input: [
      'Research the following parenting/development question using the web.',
      'Prefer authoritative, evidence-based sources from the allowed domains.',
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
