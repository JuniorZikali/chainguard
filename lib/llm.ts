import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface Invariant {
  name: string;
  description: string;
  category: 'funds_invariant' | 'access_control' | 'reentrancy' | 'integer_safety' | 'other';
}

export interface Finding {
  vulnerability_class: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  affected_function: string;
  affected_line: number | null;
  explanation: string;
  recommendation: string;
}

export interface LLMAnalysisResult {
  invariants: Invariant[];
  findings: Finding[];
  summary: string;
  risk_score: number;
}

async function callLLM(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
  });
  return response.choices?.[0]?.message?.content ?? '';
}

export async function analyseContract(
  sourceCode: string,
  contractName: string
): Promise<LLMAnalysisResult> {
  const prompt = `You are a world-class smart contract security auditor. Analyse this Solidity contract and return ONLY valid JSON with NO markdown, NO code fences, and NO preamble.

Return this exact structure:
{
  "invariants": [
    {
      "name": "short_camelCase_title",
      "description": "safety property that should always hold",
      "category": "funds_invariant"
    }
  ],
  "findings": [
    {
      "vulnerability_class": "Reentrancy",
      "severity": "Critical",
      "affected_function": "function name or N/A",
      "affected_line": null,
      "explanation": "detailed technical explanation",
      "recommendation": "concrete remediation steps"
    }
  ],
  "summary": "2-3 sentence executive summary",
  "risk_score": 0
}

severity must be one of: Critical, High, Medium, Low, Info
category must be one of: funds_invariant, access_control, reentrancy, integer_safety, other
risk_score is an integer 0-100
Generate at least 3 invariants and analyse ALL functions.

Contract name: ${contractName}

\`\`\`solidity
${sourceCode}
\`\`\``;

  const text = await callLLM(prompt);
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(clean) as LLMAnalysisResult;
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as LLMAnalysisResult;
    throw new Error('Failed to parse LLM response as JSON');
  }
}

export async function generateFoundryTests(
  sourceCode: string,
  contractName: string,
  invariants: Invariant[]
): Promise<string> {
  const invariantList = invariants
    .map((inv, i) => `${i + 1}. ${inv.name}: ${inv.description}`)
    .join('\n');

  const prompt = `Generate a Foundry fuzz test file for this Solidity contract. Return ONLY raw Solidity code, no explanation, no markdown fences.

Contract: ${contractName}
Invariants to test:
${invariantList}

\`\`\`solidity
${sourceCode}
\`\`\`

Generate a complete ${contractName}FuzzTest.t.sol that:
1. Inherits from Test (forge-std)
2. Has one invariant_ function per invariant
3. Uses vm.assume() for valid input ranges`;

  const text = await callLLM(prompt);
  return text.replace(/```solidity\n?/g, '').replace(/```\n?/g, '').trim();
}
