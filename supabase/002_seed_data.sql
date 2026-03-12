-- PROPLAB Seed Data for Demo
-- Properties distributed across ALL Ecuador

-- 1. Create demo workspace (ALL ECUADOR, not just one city)
INSERT INTO public.workspaces (id, name, description, city, country) VALUES
('a0000000-0000-0000-0000-000000000001', 'Ecuador Intelligence', 'Inteligencia inmobiliaria de todo Ecuador', 'Nacional', 'Ecuador');

-- 2. Demo Properties across Ecuador (with MercadoLibre-style image URLs)
INSERT INTO public.properties (workspace_id, title, description, price, price_per_m2, location, neighborhood, city, latitude, longitude, bedrooms, bathrooms, area_m2, has_pool, property_type, status, image_url, gallery, source, source_url) VALUES

-- GUAYAQUIL
('a0000000-0000-0000-0000-000000000001',
 'Casa Moderna en Samborondón',
 'Hermosa casa moderna en ciudadela cerrada con acabados de primera. Cocina abierta, sala de estar amplia, jardín trasero con BBQ.',
 280000, 1120, 'Samborondón, Km 5', 'La Puntilla', 'Guayaquil', -2.1394, -79.8877, 4, 3, 250, true, 'house', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_938432-MEC80933856270_122024-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_938432-MEC80933856270_122024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_832519-MEC80933856290_122024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_717820-MEC80933856310_122024-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000001'),

('a0000000-0000-0000-0000-000000000001',
 'Penthouse Puerto Santa Ana',
 'Último piso con terraza privada, vista panorámica al río Guayas, acabados importados.',
 450000, 2250, 'Puerto Santa Ana', 'Puerto Santa Ana', 'Guayaquil', -2.1871, -79.8789, 3, 2, 200, false, 'penthouse', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_782039-MEC81567890120_112024-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_782039-MEC81567890120_112024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_693128-MEC81567890140_112024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_604217-MEC81567890160_112024-F.webp'],
 'scraped', 'https://departamento.mercadolibre.com.ec/MEC-000002'),

-- QUITO
('a0000000-0000-0000-0000-000000000001',
 'Departamento González Suárez',
 'Departamento premium con vista a la ciudad. Seguridad 24/7, gimnasio, área social, 2 parqueaderos.',
 115000, 920, 'González Suárez', 'González Suárez', 'Quito', -0.2042, -78.4883, 2, 1, 125, false, 'apartment', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_659612-MEC81205432120_012025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_659612-MEC81205432120_012025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_774319-MEC81205432140_012025-F.webp'],
 'scraped', 'https://departamento.mercadolibre.com.ec/MEC-000003'),

('a0000000-0000-0000-0000-000000000001',
 'Casa en Cumbayá con Jardín',
 'Casa familiar en urbanización privada. Amplios espacios verdes, cerca de centros comerciales y escuelas.',
 320000, 1280, 'Cumbayá, Vía Interoceánica', 'Cumbayá', 'Quito', -0.1951, -78.4372, 4, 3, 250, false, 'house', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_501234-MEC81890567890_032025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_501234-MEC81890567890_032025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_412345-MEC81890567910_032025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_323456-MEC81890567930_032025-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000004'),

-- CUENCA
('a0000000-0000-0000-0000-000000000001',
 'Dúplex Vista al Río Tomebamba',
 'Hermoso dúplex con terraza y vista al río. Sector exclusivo, cerca del centro histórico de Cuenca.',
 135000, 930, 'Puertas del Sol', 'Puertas del Sol', 'Cuenca', -2.9001, -79.0059, 3, 2, 145, false, 'apartment', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_654321-MEC81890123450_032025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_654321-MEC81890123450_032025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_543210-MEC81890123470_032025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_432109-MEC81890123490_032025-F.webp'],
 'scraped', 'https://departamento.mercadolibre.com.ec/MEC-000005'),

-- MANTA (Costa)
('a0000000-0000-0000-0000-000000000001',
 'Villa Frente al Mar en Manta',
 'Villa exclusiva primera línea de playa. Piscina infinity, acceso privado a la playa, vista panorámica al Pacífico.',
 850000, 2125, 'Barbasquillo', 'Barbasquillo', 'Manta', -0.9423, -80.7341, 5, 4, 400, true, 'house', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_601928-MEC82103456780_022025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_601928-MEC82103456780_022025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_513847-MEC82103456800_022025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_428736-MEC82103456820_022025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_345625-MEC82103456840_022025-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000006'),

-- AMBATO (Sierra)
('a0000000-0000-0000-0000-000000000001',
 'Casa Rentera en Ficoa',
 '3 departamentos + local comercial. Genera $1,200/mes en renta. Excelente oportunidad de inversión.',
 210000, 700, 'Ficoa', 'Ficoa', 'Ambato', -1.2339, -78.6197, 6, 4, 300, false, 'house', 'reserved',
 'https://http2.mlstatic.com/D_NQ_NP_2X_871540-MEC80234567890_082024-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_871540-MEC80234567890_082024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_762431-MEC80234567910_082024-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000007'),

-- SALINAS (Costa)
('a0000000-0000-0000-0000-000000000001',
 'Depto Frente al Mar en Chipipe',
 'Departamento amoblado con vista directa al mar. Edificio con piscina, guardianía 24/7. Ideal para renta vacacional.',
 95000, 1360, 'Chipipe, Malecón', 'Chipipe', 'Salinas', -2.2180, -80.9590, 2, 1, 70, false, 'apartment', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_345678-MEC81234509870_012025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_345678-MEC81234509870_012025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_234567-MEC81234509890_012025-F.webp'],
 'scraped', 'https://departamento.mercadolibre.com.ec/MEC-000008'),

-- LOJA (Sierra Sur)
('a0000000-0000-0000-0000-000000000001',
 'Terreno en Vilcabamba',
 'Lote de 2,000m² con vista al valle. Clima privilegiado, ideal para proyecto eco-residencial o finca vacacional.',
 60000, 30, 'Vilcabamba', 'Vilcabamba', 'Loja', -4.2539, -79.2232, 0, 0, 2000, false, 'land', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_895127-MEC79456321880_102024-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_895127-MEC79456321880_102024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_742316-MEC79456321900_102024-F.webp'],
 'scraped', 'https://terreno.mercadolibre.com.ec/MEC-000009'),

-- ESMERALDAS (Costa Norte)
('a0000000-0000-0000-0000-000000000001',
 'Casa de Playa en Tonsupa',
 'Casa vacacional a 100m de la playa. 3 habitaciones, terraza con vista al mar, parqueadero privado.',
 145000, 725, 'Tonsupa, Km 6', 'Tonsupa', 'Esmeraldas', 0.8312, -79.8957, 3, 2, 200, false, 'house', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_567890-MEC82345678901_022025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_567890-MEC82345678901_022025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_456789-MEC82345678921_022025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_345678-MEC82345678941_022025-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000010'),

-- IBARRA (Sierra Norte)
('a0000000-0000-0000-0000-000000000001',
 'Casa en Yacucalle con Vista al Imbabura',
 'Casa amplia con vista al volcán Imbabura. Jardín grande, garaje doble, barrio residencial tranquilo.',
 175000, 875, 'Yacucalle', 'Yacucalle', 'Ibarra', 0.3489, -78.1274, 4, 3, 200, false, 'house', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_678901-MEC81456789012_032025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_678901-MEC81456789012_032025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_567890-MEC81456789032_032025-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000011'),

-- MACHALA (Costa Sur)
('a0000000-0000-0000-0000-000000000001',
 'Terreno Comercial Av. 25 de Junio',
 'Lote esquinero 600m² sobre avenida principal. Ideal para proyecto comercial, todos los servicios básicos.',
 120000, 200, 'Av. 25 de Junio', 'Centro', 'Machala', -3.2587, -79.9612, 0, 0, 600, false, 'land', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_789012-MEC80567890123_092024-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_789012-MEC80567890123_092024-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_678901-MEC80567890143_092024-F.webp'],
 'scraped', 'https://terreno.mercadolibre.com.ec/MEC-000012'),

-- SANTO DOMINGO (Sierra/Costa)
('a0000000-0000-0000-0000-000000000001',
 'Casa Familiar en Zaracay',
 'Casa de dos pisos en urbanización cerrada. Patio trasero, cocina americana, cerca de escuelas y comercio.',
 98000, 545, 'Zaracay', 'Zaracay', 'Santo Domingo', -0.2530, -79.1740, 3, 2, 180, false, 'house', 'available',
 'https://http2.mlstatic.com/D_NQ_NP_2X_890123-MEC81678901234_042025-F.webp',
 ARRAY['https://http2.mlstatic.com/D_NQ_NP_2X_890123-MEC81678901234_042025-F.webp','https://http2.mlstatic.com/D_NQ_NP_2X_789012-MEC81678901254_042025-F.webp'],
 'scraped', 'https://casa.mercadolibre.com.ec/MEC-000013');

-- 3. Demo Market Listings across Ecuador
INSERT INTO public.market_listings (workspace_id, title, price, price_per_m2, location, neighborhood, city, latitude, longitude, bedrooms, area_m2, property_type, source_portal, image_url, days_on_market, is_opportunity, opportunity_score) VALUES
('a0000000-0000-0000-0000-000000000001', 'Casa urgente Samborondón Km 3', 195000, 780, 'Samborondón Km 3', 'Ciudad Celeste', 'Guayaquil', -2.1350, -79.8810, 3, 250, 'house', 'MercadoLibre', 'https://http2.mlstatic.com/D_NQ_NP_2X_901234-MEC81234567890_012025-F.webp', 45, true, 85),
('a0000000-0000-0000-0000-000000000001', 'Depto en Urdesa', 88000, 880, 'Urdesa Central', 'Urdesa', 'Guayaquil', -2.1800, -79.9100, 2, 100, 'apartment', 'MercadoLibre', 'https://http2.mlstatic.com/D_NQ_NP_2X_812345-MEC81345678901_022025-F.webp', 12, false, 40),
('a0000000-0000-0000-0000-000000000001', 'Depto La Carolina - Quito', 125000, 1040, 'La Carolina', 'La Carolina', 'Quito', -0.1827, -78.4842, 3, 120, 'apartment', 'Properati', 'https://http2.mlstatic.com/D_NQ_NP_2X_723456-MEC81456789012_032025-F.webp', 20, false, 45),
('a0000000-0000-0000-0000-000000000001', 'Terreno Vía Daule Km 15', 32000, 64, 'Vía Daule Km 15', 'Daule', 'Guayaquil', -2.0500, -79.9500, 0, 500, 'land', 'MercadoLibre', 'https://http2.mlstatic.com/D_NQ_NP_2X_634567-MEC81567890123_042025-F.webp', 60, true, 72),
('a0000000-0000-0000-0000-000000000001', 'Casa Centro Histórico Cuenca', 220000, 1100, 'Centro Histórico', 'Centro', 'Cuenca', -2.8974, -79.0045, 3, 200, 'house', 'Plusvalía', 'https://http2.mlstatic.com/D_NQ_NP_2X_545678-MEC81678901234_052025-F.webp', 30, true, 78),
('a0000000-0000-0000-0000-000000000001', 'Lote en Atacames', 28000, 56, 'Atacames', 'Playa', 'Esmeraldas', 0.8693, -79.8371, 0, 500, 'land', 'OLX', 'https://http2.mlstatic.com/D_NQ_NP_2X_456789-MEC81789012345_062025-F.webp', 90, true, 82),
('a0000000-0000-0000-0000-000000000001', 'Casa esquinera Ceibos', 320000, 1280, 'Los Ceibos', 'Ceibos', 'Guayaquil', -2.1700, -79.9300, 4, 250, 'house', 'Properati', 'https://http2.mlstatic.com/D_NQ_NP_2X_367890-MEC81890123456_072025-F.webp', 5, false, 30),
('a0000000-0000-0000-0000-000000000001', 'Depto amoblado Chipipe', 78000, 1114, 'Chipipe', 'Chipipe', 'Salinas', -2.2175, -80.9580, 1, 70, 'apartment', 'Inmuebles24', 'https://http2.mlstatic.com/D_NQ_NP_2X_278901-MEC81901234567_082025-F.webp', 15, false, 35);

-- 4. Demo Leads from different cities
INSERT INTO public.leads (workspace_id, whatsapp_number, user_name, budget_max, budget_info, desired_location, desired_type, buyer_type, lead_score, urgency, source, raw_message) VALUES
('a0000000-0000-0000-0000-000000000001', '0991234567', 'Carlos Mendoza', 300000, 'Crédito hipotecario pre-aprobado BanEcuador', 'Samborondón', 'house', 'end_user', 82, 'high', 'chat', 'Busco casa en Samborondón con piscina, tengo crédito pre-aprobado de $300k'),
('a0000000-0000-0000-0000-000000000001', '0987654321', 'María Fernández', 150000, 'Contado', 'Quito', 'apartment', 'investor', 68, 'medium', 'whatsapp', 'Me interesa invertir en departamentos en Quito, pago al contado'),
('a0000000-0000-0000-0000-000000000001', '0976543210', 'Roberto Arias', 500000, 'Sin definir', 'Manta', 'house', 'developer', 45, 'low', 'referral', 'Soy constructor, busco propiedades frente al mar en Manta para proyecto turístico'),
('a0000000-0000-0000-0000-000000000001', '0965432109', 'Ana Lucía Paredes', 200000, 'Crédito BIESS aprobado', 'Cuenca', 'apartment', 'end_user', 75, 'high', 'chat', 'Busco departamento en Cuenca cerca del centro. Tengo crédito BIESS.'),
('a0000000-0000-0000-0000-000000000001', '0954321098', 'Fernando Bravo', 80000, 'Ahorros + crédito', 'Salinas', 'apartment', 'investor', 55, 'medium', 'whatsapp', 'Quiero comprar depto en Salinas para Airbnb, tengo hasta $80k');

-- 5. Demo Deals
INSERT INTO public.deals (workspace_id, lead_id, property_id, title, stage, deal_value, notes, next_action) VALUES
('a0000000-0000-0000-0000-000000000001',
 (SELECT id FROM public.leads WHERE whatsapp_number = '0991234567' LIMIT 1),
 (SELECT id FROM public.properties WHERE title LIKE '%Samborondón%' LIMIT 1),
 'Carlos M. → Casa Samborondón', 'showing', 280000, 'Visita agendada para el sábado', 'Confirmar hora de visita'),
('a0000000-0000-0000-0000-000000000001',
 (SELECT id FROM public.leads WHERE whatsapp_number = '0987654321' LIMIT 1),
 (SELECT id FROM public.properties WHERE title LIKE '%González%' LIMIT 1),
 'María F. → Depto Quito', 'contacted', 115000, 'Envió WhatsApp con las fotos', 'Esperar respuesta'),
('a0000000-0000-0000-0000-000000000001',
 (SELECT id FROM public.leads WHERE whatsapp_number = '0965432109' LIMIT 1),
 (SELECT id FROM public.properties WHERE title LIKE '%Tomebamba%' LIMIT 1),
 'Ana L. → Dúplex Cuenca', 'offer', 135000, 'Ofreció $130k, esperando contraoferta', 'Negociar precio final');

-- 6. Demo Alerts from across Ecuador
INSERT INTO public.smart_alerts (workspace_id, type, title, message) VALUES
('a0000000-0000-0000-0000-000000000001', 'opportunity', '🔥 Oportunidad en Guayaquil', 'Casa en Samborondón Km 3 está $85k por debajo del promedio de la zona. Lleva 45 días publicada — posible negociación agresiva.'),
('a0000000-0000-0000-0000-000000000001', 'lead', '📥 Nuevo lead en Cuenca', 'Ana Lucía Paredes busca departamento en Cuenca con crédito BIESS. Lead Score: 75/100.'),
('a0000000-0000-0000-0000-000000000001', 'market', '📊 Oportunidad en Esmeraldas', 'Lote en Atacames a $56/m² — 40% debajo del promedio de zona costera. 90 días en mercado, alta probabilidad de negociación.'),
('a0000000-0000-0000-0000-000000000001', 'opportunity', '⚡ Cuenca: precio competitivo', 'Casa en Centro Histórico de Cuenca a $1,100/m² — 15% debajo del promedio. Score de oportunidad: 78/100.'),
('a0000000-0000-0000-0000-000000000001', 'lead', '📥 Nuevo lead capturado', 'Carlos Mendoza busca casa en Samborondón con crédito pre-aprobado de $300k. Lead Score: 82/100.');
