import { NextResponse } from 'next/server';

const KNOWLEDGE_BASE = [
  {
    keywords: ['shilajit', 'mineral', 'fulvic'],
    answer: 'Purified Himalayan Shilajit is rich in Fulvic Acid and contains over 84 ionic trace minerals. It works at the cellular level to stimulate ATP (Adenosine Triphosphate) production, which significantly enhances physical stamina, combats chronic fatigue, and aids post-workout muscle recovery.'
  },
  {
    keywords: ['ashwagandha', 'ksm', 'stress', 'cortisol'],
    answer: 'We use clinical-grade KSM-65 Ashwagandha extract. It is a powerful adaptogenic herb clinically proven to reduce cortisol (the body\'s primary stress hormone) by up to 27%, thereby alleviating daily fatigue, improving muscle recovery, and promoting restful sleep.'
  },
  {
    keywords: ['safed musli', 'musli', 'vitality'],
    answer: 'Safed Musli is highly regarded in traditional Ayurveda as a natural vitalizer. It nourishes muscle tissues, combats physical exhaustion, and supports overall endurance and stamina.'
  },
  {
    keywords: ['gokshura', 'tribulus', 'nitric oxide'],
    answer: 'Gokshura (Tribulus terrestris) naturally supports testosterone synthesis and increases nitric oxide production in the blood. This improves muscle pump, speeds up recovery times, and enhances physical energy.'
  },
  {
    keywords: ['dosage', 'dose', 'take', 'how to use'],
    answer: 'For general stamina and recovery, take 1 capsule daily after dinner with warm water or milk. For moderate to severe exhaustion, take 2 capsules daily (1 after breakfast, 1 after dinner). Do not exceed 2 capsules per day unless advised by a specialist.'
  },
  {
    keywords: ['side effect', 'safe', 'natural', 'chemical'],
    answer: 'Adivance Capsule is formulated with 100% natural, GMP-certified botanical extracts. It is free from chemical additives, synthetic fillers, and heavy metals. There are no reported side effects when taken in the recommended dosage.'
  },
  {
    keywords: ['delivery', 'shipping', 'shipping cost', 'free shipping'],
    answer: 'Nexoveda offers free standard shipping globally on all orders above $50.00. For orders under $50.00, shipping is a flat rate of $5.00. Standard delivery takes 3 to 5 business days worldwide.'
  },
  {
    keywords: ['counselling', 'counseling', 'doctor', 'consult', 'chat', 'free'],
    answer: 'Nexoveda provides completely free, ongoing, and anonymous online consultation services. You can connect with our Male/Female Ayurvedic Doctors or Mental Health Specialists to discuss physical wellness, relationship intimacy, and emotional wellbeing.'
  }
];

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ answer: 'Please enter a valid question.' }, { status: 400 });
    }

    const query = question.toLowerCase();
    
    // Check local knowledge base
    let matchedAnswer = '';
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(keyword => query.includes(keyword))) {
        matchedAnswer = item.answer;
        break;
      }
    }

    if (matchedAnswer) {
      return NextResponse.json({
        source: 'Nexoveda Knowledge Base',
        answer: matchedAnswer
      });
    }

    // Google Search simulation fallback
    const googleAnswers = [
      `Google search results show that Nexoveda\'s flagship product, Adivance Capsule, is a trusted herbal vitality supplement. It utilizes standardized extracts like Shilajit (stamina), Ashwagandha (stress relief), and Gokshura (muscle recovery) with high efficacy rates.`,
      `According to search trends, combining natural Ayurvedic supplements like Shilajit with professional relationship and mental health counselling offers a comprehensive, highly effective approach to overall marital and intimate wellness.`,
      `Google search results recommend taking adaptogens like Ashwagandha consistently for at least 2-4 weeks to experience the full benefits in fatigue reduction, energy improvement, and cortisol regulation.`
    ];

    // Pick a mock search result based on string length hash
    const idx = query.length % googleAnswers.length;
    const finalAnswer = googleAnswers[idx];

    return NextResponse.json({
      source: 'Google Search Result',
      answer: `🔍 According to Google Search:\n${finalAnswer}`
    });
  } catch (err: any) {
    return NextResponse.json({ answer: 'Sorry, I failed to process your question at this moment.' }, { status: 500 });
  }
}
