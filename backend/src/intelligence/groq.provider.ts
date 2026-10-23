import Groq from 'groq-sdk';
import {
  IntelligenceProvider,
  TrendAnalysisInput,
  TrendAnalysisOutput,
  ClassificationInput,
  ClassificationOutput,
  SignalSummaryInput,
  SignalSummaryOutput,
  BusinessMatchInput,
  BusinessMatchOutput,
  OpportunityInput,
  OpportunityOutput,
  ActionPlanInput,
  ActionPlanOutput,
  ExperimentAnalysisInput,
  ExperimentAnalysisOutput,
  AskTGoInput,
  AskTGoOutput,
} from './intelligence.interface';
import { MockIntelligenceProvider } from './mock.provider';
import { config } from '../config/env';

export class GroqIntelligenceProvider implements IntelligenceProvider {
  public name = 'groq';
  private groq: Groq | null = null;
  private fallback = new MockIntelligenceProvider();
  private model: string;

  constructor() {
    const raw = (config.groqModel || '').trim();
    // Groq supported models: llama-3.3-70b-versatile, llama-3.1-8b-instant, etc.
    this.model = (!raw || raw.startsWith('openai/') || raw.includes('gpt')) 
      ? 'llama-3.3-70b-versatile' 
      : raw;
    if (config.groqApiKey && config.groqApiKey.trim().length > 0) {
      try {
        this.groq = new Groq({ apiKey: config.groqApiKey });
      } catch (err: any) {
        console.warn('[GroqProvider] Failed to initialize Groq client:', err.message);
      }
    }
  }

  private isConfigured(): boolean {
    return Boolean(this.groq && config.groqApiKey && config.groqApiKey.trim().length > 0);
  }

  public async analyzeTrend(input: TrendAnalysisInput): Promise<TrendAnalysisOutput> {
    if (!this.isConfigured() || !this.groq) {
      return this.fallback.analyzeTrend(input);
    }

    try {
      const prompt = `You are an expert market trend analyst. Analyze the following trend data:
Trend Name: ${input.trendContext.name}
Category: ${input.trendContext.category}
Headline: ${input.trendContext.headline || ''}
Description: ${input.trendContext.description || ''}
Momentum: ${input.trendContext.momentum || ''}

Return a single JSON object with:
{
  "momentum": "HIGH" | "MEDIUM" | "LOW",
  "score": number (0-100),
  "confidence": number (0-1),
  "reasoning": string,
  "lifecycle": "EMERGING" | "RISING" | "PEAKING" | "STABLE",
  "growthIndicators": string[],
  "riskFactor": "LOW" | "MEDIUM" | "HIGH",
  "evidenceIds": string[]
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a business intelligence assistant that responds strictly in valid JSON.' },
          { role: 'user', content: prompt },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');
      const parsed = JSON.parse(content);
      return {
        momentum: parsed.momentum || 'HIGH',
        score: typeof parsed.score === 'number' ? parsed.score : 85,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
        reasoning: parsed.reasoning || 'Trend displays significant regional growth signals.',
        lifecycle: parsed.lifecycle || 'RISING',
        growthIndicators: Array.isArray(parsed.growthIndicators) ? parsed.growthIndicators : ['High search interest surge', 'Social channel velocity'],
        riskFactor: parsed.riskFactor || 'LOW',
        evidenceIds: Array.isArray(parsed.evidenceIds) ? parsed.evidenceIds : ['groq-analysis-01'],
      };
    } catch (err: any) {
      console.warn('[GroqProvider] analyzeTrend call failed, falling back to mock:', err.message);
      return this.fallback.analyzeTrend(input);
    }
  }

  public async matchBusiness(input: BusinessMatchInput): Promise<BusinessMatchOutput> {
    if (!this.isConfigured() || !this.groq) {
      return this.fallback.matchBusiness(input);
    }

    try {
      const prompt = `Evaluate how well this trend fits the given business:
Business: ${input.businessContext.businessName} (${input.businessContext.industry}, ${input.businessContext.businessType})
Location: ${input.businessContext.location}
Products: ${input.businessContext.products.join(', ')}
Trend: ${input.trendContext.name} (${input.trendContext.category})

Return a single JSON object with:
{
  "customerFit": number (0-100),
  "productFit": number (0-100),
  "locationFit": number (0-100),
  "goalAlignment": number (0-100),
  "budgetFit": number (0-100),
  "businessFit": number (0-100),
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "confidence": number (0-1),
  "reasoning": string,
  "synergies": string[],
  "potentialBottlenecks": string[],
  "evidenceIds": string[]
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You evaluate business trend opportunities. Output strictly valid JSON.' },
          { role: 'user', content: prompt },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');
      const parsed = JSON.parse(content);
      return {
        customerFit: parsed.customerFit || 85,
        productFit: parsed.productFit || 80,
        locationFit: parsed.locationFit || 90,
        goalAlignment: parsed.goalAlignment || 85,
        budgetFit: parsed.budgetFit || 85,
        businessFit: parsed.businessFit || Math.round(((parsed.customerFit || 85) + (parsed.productFit || 80) + (parsed.locationFit || 90)) / 3),
        risk: parsed.risk || 'LOW',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.88,
        reasoning: parsed.reasoning || 'Strong fit with current demographic and kitchen capabilities.',
        synergies: Array.isArray(parsed.synergies) ? parsed.synergies : ['Existing equipment synergy', 'Cross-sell opportunity'],
        potentialBottlenecks: Array.isArray(parsed.potentialBottlenecks) ? parsed.potentialBottlenecks : ['Initial ingredient sourcing'],
        evidenceIds: Array.isArray(parsed.evidenceIds) ? parsed.evidenceIds : ['groq-match-01'],
      };
    } catch (err: any) {
      console.warn('[GroqProvider] matchBusiness call failed, falling back to mock:', err.message);
      return this.fallback.matchBusiness(input);
    }
  }

  public async generateOpportunity(input: OpportunityInput): Promise<OpportunityOutput> {
    if (!this.isConfigured() || !this.groq) {
      return this.fallback.generateOpportunity(input);
    }

    try {
      const prompt = `Generate a realistic commercial opportunity for this business:
Business: ${input.businessContext.businessName} (${input.businessContext.location})
Trend: ${input.trendContext.name}

Return a single JSON object:
{
  "title": string,
  "description": string,
  "score": number (0-100),
  "businessFit": number (0-100),
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "confidence": number (0-1),
  "potentialAction": string,
  "estimatedTimeframe": string,
  "targetCustomerSegment": string,
  "revenuePotential": "MODEST" | "MODERATE" | "HIGH" | "SIGNIFICANT"
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'Generate concrete business opportunities. Output strictly valid JSON.' },
          { role: 'user', content: prompt },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');
      return JSON.parse(content);
    } catch (err: any) {
      console.warn('[GroqProvider] generateOpportunity failed, falling back to mock:', err.message);
      return this.fallback.generateOpportunity(input);
    }
  }

  public async generateActionPlan(input: ActionPlanInput): Promise<ActionPlanOutput> {
    if (!this.isConfigured() || !this.groq) {
      return this.fallback.generateActionPlan(input);
    }

    try {
      const prompt = `Create a step-by-step experiment-oriented action plan for:
Business: ${input.businessContext.businessName}
Opportunity: ${input.opportunityTitle || 'Regional trend opportunity'}
Trend: ${input.trendContext.name}

Return JSON matching:
{
  "title": string,
  "whyNow": string,
  "whyThisBusiness": string,
  "targetCustomer": string,
  "whatToLaunch": string,
  "suggestedPrice": string,
  "promotionStrategy": string,
  "testTiming": string,
  "testDuration": string,
  "successMetrics": string[],
  "risks": string[],
  "stopCriteria": string[],
  "continueCriteria": string[],
  "expectedLearning": string
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'Create execution plans for small businesses. Output strictly valid JSON.' },
          { role: 'user', content: prompt },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || `7-Day ${input.trendContext.name} Pilot`,
        whyNow: parsed.whyNow || 'Rapid search surge indicates immediate demand.',
        whyThisBusiness: parsed.whyThisBusiness || 'Leverages current equipment and workflow.',
        targetCustomer: parsed.targetCustomer || 'Local patrons and students',
        whatToLaunch: parsed.whatToLaunch || `Introductory ${input.trendContext.name} special`,
        suggestedPrice: parsed.suggestedPrice || '₹99 introductory',
        promotionStrategy: parsed.promotionStrategy || 'In-store tent cards and Instagram story',
        testTiming: parsed.testTiming || 'Starting next Monday',
        testDuration: parsed.testDuration || '7 days',
        successMetrics: Array.isArray(parsed.successMetrics) ? parsed.successMetrics : ['15 units/day'],
        risks: Array.isArray(parsed.risks) ? parsed.risks : ['Ingredient availability'],
        stopCriteria: Array.isArray(parsed.stopCriteria) ? parsed.stopCriteria : ['Fewer than 5 units sold over 3 days'],
        continueCriteria: Array.isArray(parsed.continueCriteria) ? parsed.continueCriteria : ['Over 15 units sold daily with 70%+ positive feedback'],
        expectedLearning: parsed.expectedLearning || 'Validates customer price sensitivity and prep speed.',
      };
    } catch (err: any) {
      console.warn('[GroqProvider] generateActionPlan failed, falling back to mock:', err.message);
      return this.fallback.generateActionPlan(input);
    }
  }

  public async analyzeExperiment(input: ExperimentAnalysisInput): Promise<ExperimentAnalysisOutput> {
    if (!this.isConfigured() || !this.groq) {
      return this.fallback.analyzeExperiment(input);
    }

    try {
      const prompt = `Analyze this experiment results:
Experiment: ${input.experimentName}
Metrics: ${JSON.stringify(input.recordedMetrics)}
Baseline: ${JSON.stringify(input.baseline)}

Return JSON matching:
{
  "statusOutcome": "SUCCESS" | "INCONCLUSIVE" | "FAILED",
  "summary": string,
  "keyInsights": string[],
  "suggestedDecision": "SCALE" | "ITERATE" | "STOP" | "CONTINUE",
  "nextSteps": string[],
  "learnedImpactScore": number (0-100)
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'Analyze experiment results for business intelligence. Output valid JSON.' },
          { role: 'user', content: prompt },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');
      return JSON.parse(content);
    } catch (err: any) {
      console.warn('[GroqProvider] analyzeExperiment failed, falling back to mock:', err.message);
      return this.fallback.analyzeExperiment(input);
    }
  }

  public async answerBusinessQuestion(input: AskTGoInput): Promise<AskTGoOutput> {
    if (!this.isConfigured() || !this.groq) {
      return this.fallback.answerBusinessQuestion(input);
    }

    try {
      const prompt = `The owner of "${input.businessContext.businessName}" (${input.businessContext.industry} in ${input.businessContext.location}) asks:
"${input.question}"

Active context:
- Goals: ${input.businessContext.businessGoal}
- Current products: ${input.businessContext.products.join(', ')}

Provide a strategic, highly actionable answer tailored to their local market.
Return JSON matching:
{
  "answer": string (markdown supported),
  "actionableRecommendations": string[],
  "citedTrends": Array<{ "trendId": string, "name": string }>,
  "suggestedFollowUps": string[]
}`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are T→G Business Intelligence Advisor powered by Groq. Provide practical, high-value commercial advice in JSON format.' },
          { role: 'user', content: prompt },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');
      const parsed = JSON.parse(content);
      return {
        answer: parsed.answer || 'Analyzing trend velocity and local demand patterns.',
        actionableRecommendations: Array.isArray(parsed.actionableRecommendations) ? parsed.actionableRecommendations : ['Launch 7-day test combo'],
        citedTrends: Array.isArray(parsed.citedTrends) ? parsed.citedTrends : [],
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : ['What are the expected margins?'],
      };
    } catch (err: any) {
      console.warn('[GroqProvider] answerBusinessQuestion failed, falling back to mock:', err.message);
      return this.fallback.answerBusinessQuestion(input);
    }
  }

  public async classifyTrend(input: ClassificationInput): Promise<ClassificationOutput> {
    return this.fallback.classifyTrend(input);
  }

  public async summarizeSignals(input: SignalSummaryInput): Promise<SignalSummaryOutput> {
    return this.fallback.summarizeSignals(input);
  }
}
