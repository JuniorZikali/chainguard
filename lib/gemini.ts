import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
  risk_score: number; // 0-100
}

const SYSTEM_PROMPT = `You are a world-class smart contract security auditor with expertise in formal verification, 
Solidity security patterns, and DeFi vulnerabilities. You have deep knowledge of common attack vectors including 
reentrancy, access control flaws, integer overflow/underflow, front-running, flash loan attacks, and business logic errors.

Analyse the provided Solidity smart contract with extreme thoroughness. Return ONLY valid JSON with NO markdown, 
NO code fences, and NO preamble. The JSON must match this exact structure:

{
  "invariants": [
    {
      "name": "short_camelCase_title",
      "description": "Natural language description of a safety property that should always hold",
      "category": "funds_invariant | access_control | reentrancy | integer_safety | other"
    }
  ],
  "findings": [
    {
      "vulnerability_class": "Reentrancy | Access Control | Integer Overflow | Flash Loan | Front-Running | Business Logic | Gas DoS | Uninitialized Storage | Other",
      "severity": "Critical | High | Medium | Low | Info",
      "affected_function": "function name or 'N/A'",
      "affected_line": null,
      "explanation": "Detailed technical explanation of the vulnerability",
      "recommendation": "Concrete remediation steps with code examples where applicable"
    }
  ],
  "summary": "Executive summary of the overall contract security posture in 2-3 sentences",
  "risk_score": 0
}

The risk_score must be an integer from 0 (no risk) to 100 (critical/broken contract). 
Base it on: severity of findings, number of Critical/High issues, and overall contract complexity.
Generate at least 3 invariants and analyse ALL functions for potential vulnerabilities.`;

export async function analyseContract(sourceCode: string, contractName: string): Promise<LLMAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `${SYSTEM_PROMPT}\n\nContract name: ${contractName}\n\n\`\`\`solidity\n${sourceCode}\n\`\`\``;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip any accidental markdown fences
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(clean) as LLMAnalysisResult;
  } catch {
    // Attempt recovery: extract JSON object
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as LLMAnalysisResult;
    }
    throw new Error('Failed to parse LLM response as JSON');
  }
}

export async function generateFoundryTests(sourceCode: string, contractName: string, invariants: Invariant[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const invariantList = invariants.map((inv, i) => `${i + 1}. ${inv.name}: ${inv.description}`).join('\n');

  const prompt = `You are a Solidity test engineer. Generate a Foundry fuzz test file for the following smart contract.

Contract name: ${contractName}

Invariants to test:
${invariantList}

Solidity contract:
\`\`\`solidity
${sourceCode}
\`\`\`

Generate a complete Foundry test file (${contractName}FuzzTest.t.sol) that:
1. Inherits from Test
2. Uses forge-std
3. Has one invariant_ function per invariant above
4. Uses vm.assume() for valid input ranges
5. Tests each invariant with realistic fuzz inputs

Return ONLY the raw Solidity code, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.replace(/```solidity\n?/g, '').replace(/```\n?/g, '').trim();
}
