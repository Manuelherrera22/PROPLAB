import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { message, workspaceId } = await req.json();
    const supabase = createServerClient();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // 1. Fetch context: properties + leads + market data
    const [propsRes, leadsRes, marketRes, knowledgeRes] = await Promise.all([
      supabase.from("properties").select("*").eq("workspace_id", workspaceId),
      supabase.from("leads").select("*").eq("workspace_id", workspaceId),
      supabase.from("market_listings").select("*").eq("workspace_id", workspaceId).limit(20),
      supabase.from("knowledge_entries").select("*").eq("workspace_id", workspaceId),
    ]);

    const properties = propsRes.data || [];
    const leads = leadsRes.data || [];
    const market = marketRes.data || [];
    const knowledge = knowledgeRes.data || [];

    // 2. Build rich system prompt
    const systemPrompt = `
Eres el AI Sales Advisor de PROPLAB — un asistente de inteligencia artificial experto en ventas inmobiliarias.

TU CONTEXTO ACTUAL (datos reales del workspace):

📦 INVENTARIO DE PROPIEDADES (${properties.length}):
${properties.map(p => `- "${p.title}" | ${p.property_type} | $${p.price?.toLocaleString()} | ${p.location} | ${p.bedrooms} cuartos | ${p.area_m2}m² | Estado: ${p.status}`).join("\n")}

👥 LEADS ACTIVOS (${leads.length}):
${leads.map(l => `- ${l.user_name || "Anónimo"} | Tel: ${l.whatsapp_number} | Busca: ${l.desired_type} en ${l.desired_location} | Presupuesto: ${l.budget_info} | Score: ${l.lead_score} | Urgencia: ${l.urgency}`).join("\n")}

📊 MERCADO COMPETITIVO (${market.length} listados):
${market.map(m => `- "${m.title}" | $${m.price?.toLocaleString()} | ${m.location} | ${m.source_portal} | ${m.days_on_market} días | Oportunidad: ${m.is_opportunity ? `SÍ (Score: ${m.opportunity_score})` : "No"}`).join("\n")}

📚 BASE DE CONOCIMIENTO:
${knowledge.map(k => `[${k.title}]: ${k.content}`).join("\n")}

REGLAS:
1. Habla en español, de forma profesional pero cercana.
2. Siempre basa tus respuestas en los DATOS REALES del workspace.
3. Si te preguntan por propiedades, busca en tu inventario y muéstralas.
4. Si te piden generar contenido (descripciones, mensajes de WhatsApp, scripts), hazlo basado en datos reales.
5. Si detectas que el usuario menciona un número de teléfono, extrae la info de contacto.
6. Al recomendar propiedades a leads, explica POR QUÉ esa propiedad es ideal para ese perfil.
7. Si te preguntan sobre precios de mercado, usa los datos de market_listings para comparar.
8. Cuando generes mensajes de WhatsApp, hazlos cortos, profesionales, y con un CTA claro.
9. Puedes sugerir estrategias de negociación basadas en los días en el mercado y el opportunity_score.
10. Siempre cierra con una sugerencia de siguiente paso o una pregunta de seguimiento.
`;

    // 3. Use GPT-4o to parse the query and find relevant properties
    const filterPrompt = `
Extrae filtros de búsqueda de este mensaje del usuario. Si no menciona un filtro, omítelo.
Responde SOLO JSON válido con: min_price, max_price, min_bedrooms, property_type, location, is_content_request (boolean - true si pide generar texto/descripción/mensaje).
Mensaje: "${message}"
`;

    const filterRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: filterPrompt }],
      response_format: { type: "json_object" },
    });

    const filters = JSON.parse(filterRes.choices[0].message.content || "{}");

    // 4. Filter properties based on extracted criteria
    let matchedProperties = properties;
    if (filters.min_price) matchedProperties = matchedProperties.filter(p => p.price >= filters.min_price);
    if (filters.max_price) matchedProperties = matchedProperties.filter(p => p.price <= filters.max_price);
    if (filters.min_bedrooms) matchedProperties = matchedProperties.filter(p => p.bedrooms >= filters.min_bedrooms);
    if (filters.property_type) matchedProperties = matchedProperties.filter(p => p.property_type === filters.property_type);
    if (filters.location) matchedProperties = matchedProperties.filter(p => p.location?.toLowerCase().includes(filters.location.toLowerCase()) || p.city?.toLowerCase().includes(filters.location.toLowerCase()));

    // 5. Generate the AI response
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${message}\n\n[Propiedades que coinciden con la búsqueda: ${matchedProperties.length > 0 ? matchedProperties.map(p => p.title).join(", ") : "ninguna específica, pero tengo estas en inventario: " + properties.map(p => p.title).join(", ")}]` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiMessage = chatResponse.choices[0].message.content;

    // 6. Lead capture logic
    const phoneRegex = /[\d\s\-\+\(\)]{8,15}/;
    if (phoneRegex.test(message)) {
      try {
        const leadExtractionPrompt = `
Analiza este mensaje y extrae info de contacto. Devuelve JSON con:
- whatsapp_number: (string)
- user_name: (string o null)
- budget_info: (string o null)
- desired_location: (string o null)
- desired_type: (string o null)
- urgency: ("low", "medium", "high", "immediate")
Mensaje: "${message}"
`;
        const leadRes = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: leadExtractionPrompt }],
          response_format: { type: "json_object" },
        });

        const leadData = JSON.parse(leadRes.choices[0].message.content || "{}");
        if (leadData.whatsapp_number && leadData.whatsapp_number.length >= 8) {
          // Calculate lead score
          let score = 30;
          if (leadData.budget_info) score += 25;
          if (leadData.desired_location) score += 15;
          if (leadData.urgency === "high" || leadData.urgency === "immediate") score += 20;
          if (matchedProperties.length > 0) score += 10;

          await supabase.from("leads").insert([{
            workspace_id: workspaceId,
            whatsapp_number: leadData.whatsapp_number,
            user_name: leadData.user_name,
            budget_info: leadData.budget_info,
            desired_location: leadData.desired_location || filters.location,
            desired_type: leadData.desired_type || filters.property_type,
            lead_score: Math.min(score, 100),
            urgency: leadData.urgency || "medium",
            source: "chat",
            raw_message: message,
            property_id: matchedProperties.length > 0 ? matchedProperties[0].id : null,
          }]);

          // Create alert
          await supabase.from("smart_alerts").insert([{
            workspace_id: workspaceId,
            type: "lead",
            title: `📥 Nuevo lead: ${leadData.user_name || "Anónimo"}`,
            message: `Lead capturado via AI Chat. Score: ${Math.min(score, 100)}. Busca: ${leadData.desired_type || "propiedad"} en ${leadData.desired_location || "sin definir"}.`,
          }]);

          // Save search tracking in Radar
          let parsedMaxPrice = filters.max_price || null;
          if (leadData.budget_info) {
             const budgetMatch = leadData.budget_info.match(/[\d,.]+/);
             if (budgetMatch) parsedMaxPrice = parseFloat(budgetMatch[0].replace(/,/g, ''));
          }

          await supabase.from("saved_searches").insert([{
            workspace_id: workspaceId,
            whatsapp_number: leadData.whatsapp_number,
            user_name: leadData.user_name,
            desired_location: leadData.desired_location || filters.location,
            max_price: parsedMaxPrice,
            min_bedrooms: filters.min_bedrooms || null,
            property_type: leadData.desired_type || filters.property_type,
            status: matchedProperties.length > 0 ? "matched" : "pending"
          }]);
        }
      } catch (e) {
        console.error("Lead capture error:", e);
      }
    }

    // Only return matched properties if the query was a search (not content generation)
    const returnProperties = !filters.is_content_request && matchedProperties.length > 0
      ? matchedProperties.slice(0, 5)
      : [];

    return NextResponse.json({
      text: aiMessage,
      properties: returnProperties,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { text: "Error al procesar tu solicitud. Verifica tus API keys.", properties: [] },
      { status: 500 }
    );
  }
}
