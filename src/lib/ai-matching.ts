/**
 * Server-side only AI matching module.
 * Uses Anthropic Claude API for intelligent replacement suggestions.
 * The API key is NEVER exposed to the frontend.
 */

interface AIMatchContext {
  clientName: string;
  clientAddress: string;
  requiredLanguages: string[];
  requiredSkills: string[];
  requiredCertifications: string[];
  schedule: string;
  absentEmployeeName: string;
  date: string;
  candidates: {
    name: string;
    score: number;
    languages: string[];
    skills: string[];
    isStandby: boolean;
    isAvailable: boolean;
    reasons: string[];
    exclusionReasons?: string[];
  }[];
}

interface AIAnalysis {
  recommendation: string;
  reasoning: string;
  riskAssessment: string;
  alternativeStrategy: string;
}

export async function getAIAnalysis(context: AIMatchContext): Promise<AIAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      recommendation: 'Configuration IA non disponible.',
      reasoning: 'Clé API non configurée.',
      riskAssessment: 'N/A',
      alternativeStrategy: 'N/A',
    };
  }

  const availableCandidates = context.candidates.filter(c => c.isAvailable);
  const excludedCandidates = context.candidates.filter(c => !c.isAvailable);

  const prompt = `Tu es l'assistant IA de planification de Samsic Facility Luxembourg. Tu aides les planners à trouver rapidement des remplaçants qualifiés pour les postes d'accueil (réception) et de nettoyage.

CONTEXTE DE L'ABSENCE:
- Client: ${context.clientName} (${context.clientAddress})
- Date: ${context.date}
- Employé absent: ${context.absentEmployeeName}
- Horaires du poste: ${context.schedule}
- Langues requises: ${context.requiredLanguages.join(', ')}
- Compétences requises: ${context.requiredSkills.join(', ')}
${context.requiredCertifications.length > 0 ? `- Certifications requises: ${context.requiredCertifications.join(', ')}` : ''}

CANDIDATS DISPONIBLES (${availableCandidates.length}):
${availableCandidates.map((c, i) => `${i + 1}. ${c.name} — Score: ${c.score.toFixed(1)}% — Langues: ${c.languages.join(', ')} — ${c.isStandby ? 'STAND-BY du client' : 'Disponible'} — Points forts: ${c.reasons.join(', ')}`).join('\n')}

CANDIDATS EXCLUS (${excludedCandidates.length}):
${excludedCandidates.map(c => `- ${c.name}: ${c.exclusionReasons?.join(', ') ?? 'Non disponible'}`).join('\n')}

Analyse la situation et donne:
1. RECOMMANDATION: Quel candidat choisir en priorité et pourquoi (2-3 phrases)
2. RAISONNEMENT: Explication du matching IA (facteurs clés qui ont pesé)
3. ÉVALUATION DES RISQUES: Risques éventuels de cette affectation (continuité de service, satisfaction client)
4. STRATÉGIE ALTERNATIVE: Que faire si le candidat recommandé refuse

Réponds en JSON avec les clés: recommendation, reasoning, riskAssessment, alternativeStrategy
Sois concis et opérationnel. Le planner doit pouvoir agir immédiatement.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return getFallbackAnalysis(context);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recommendation: parsed.recommendation ?? 'Analyse non disponible.',
        reasoning: parsed.reasoning ?? '',
        riskAssessment: parsed.riskAssessment ?? '',
        alternativeStrategy: parsed.alternativeStrategy ?? '',
      };
    }

    return getFallbackAnalysis(context);
  } catch (error) {
    console.error('AI matching error:', error);
    return getFallbackAnalysis(context);
  }
}

function getFallbackAnalysis(context: AIMatchContext): AIAnalysis {
  const best = context.candidates.filter(c => c.isAvailable).sort((a, b) => b.score - a.score)[0];

  if (!best) {
    return {
      recommendation: `Aucun candidat disponible pour ${context.clientName}. Contactez le responsable de zone.`,
      reasoning: 'Tous les employés éligibles sont déjà affectés ou indisponibles.',
      riskAssessment: 'Risque élevé de poste non couvert. Action manuelle requise.',
      alternativeStrategy: 'Vérifier les employés en formation ou contacter des intérimaires.',
    };
  }

  return {
    recommendation: `${best.name} est le meilleur candidat avec un score de ${best.score.toFixed(1)}%.${best.isStandby ? ' Employé stand-by du client, connait déjà le site.' : ''}`,
    reasoning: `Score basé sur: langues (35%), compétences (25%), disponibilité (20%), expérience site (10%), priorité stand-by (10%).`,
    riskAssessment: best.score >= 80 ? 'Risque faible. Profil bien adapté au poste.' : 'Risque modéré. Vérifier les points de formation manquants.',
    alternativeStrategy: context.candidates.filter(c => c.isAvailable).length > 1
      ? `En cas de refus, contacter ${context.candidates.filter(c => c.isAvailable)[1]?.name}.`
      : 'Aucun autre candidat disponible. Envisager un remplacement inter-sites.',
  };
}
