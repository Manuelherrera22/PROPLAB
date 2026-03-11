-- PROPLAB Seed Data for Demo

-- 1. Create demo workspace
INSERT INTO public.workspaces (id, name, description, city, country) VALUES
('a0000000-0000-0000-0000-000000000001', 'Guayaquil Premium', 'Propiedades premium en Guayaquil y alrededores', 'Guayaquil', 'Ecuador');

-- 2. Demo Properties
INSERT INTO public.properties (workspace_id, title, description, price, price_per_m2, location, neighborhood, city, latitude, longitude, bedrooms, bathrooms, area_m2, has_pool, property_type, status, image_url, source) VALUES
('a0000000-0000-0000-0000-000000000001', 'Casa Moderna en Samborondón', 'Hermosa casa moderna en ciudadela cerrada con acabados de primera. Cocina abierta, sala de estar amplia, jardín trasero.', 280000, 1120, 'Samborondón, Km 5', 'La Puntilla', 'Guayaquil', -2.1394, -79.8877, 4, 3, 250, true, 'house', 'available', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', 'manual'),

('a0000000-0000-0000-0000-000000000001', 'Departamento González Suárez', 'Departamento premium con vista a la ciudad. Seguridad 24/7, gimnasio, área social.', 115000, 920, 'Quito, González Suárez', 'González Suárez', 'Quito', -0.2042, -78.4883, 2, 1, 125, false, 'apartment', 'available', 'https://images.unsplash.com/photo-1502672260266-1c1e52b1e1cd?auto=format&fit=crop&w=800&q=80', 'manual'),

('a0000000-0000-0000-0000-000000000001', 'Terreno Comercial Vía a la Costa', 'Lote esquinero ideal para proyecto comercial o residencial. Todos los servicios básicos.', 45000, 90, 'Guayaquil, Vía a la Costa', 'Vía a la Costa Km 12', 'Guayaquil', -2.2150, -80.0123, 0, 0, 500, false, 'land', 'available', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 'manual'),

('a0000000-0000-0000-0000-000000000001', 'Villa de Lujo Frente al Mar', 'Villa exclusiva con piscina infinity, acceso privado a la playa, 4 parqueaderos.', 850000, 2125, 'Playas, General Villamil', 'Playa Dorada', 'Playas', -2.6341, -80.3918, 5, 4, 400, true, 'house', 'available', 'https://images.unsplash.com/photo-1613490908653-b40ecdcfce3e?auto=format&fit=crop&w=800&q=80', 'manual'),

('a0000000-0000-0000-0000-000000000001', 'Penthouse Centro Empresarial', 'Último piso con terraza privada, vista panorámica, acabados importados. Ideal para ejecutivos.', 450000, 2250, 'Guayaquil, Puerto Santa Ana', 'Puerto Santa Ana', 'Guayaquil', -2.1871, -79.8789, 3, 2, 200, false, 'penthouse', 'available', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 'manual'),

('a0000000-0000-0000-0000-000000000001', 'Casa Rentera en Ambato', '3 departamentos + local comercial. Genera $1,200/mes en renta. Oportunidad de inversión.', 210000, 700, 'Ambato, Ficoa', 'Ficoa', 'Ambato', -1.2339, -78.6197, 6, 4, 300, false, 'house', 'reserved', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80', 'manual'),

('a0000000-0000-0000-0000-000000000001', 'Dúplex con Vista al Río Tomebamba', 'Hermoso dúplex con terraza y vista al río. Sector exclusivo, cerca del centro histórico.', 135000, 930, 'Cuenca, Puertas del Sol', 'Puertas del Sol', 'Cuenca', -2.9001, -79.0059, 3, 2, 145, false, 'apartment', 'available', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'manual');

-- 3. Demo Market Listings (competitive intel)
INSERT INTO public.market_listings (workspace_id, title, price, price_per_m2, location, neighborhood, city, latitude, longitude, bedrooms, area_m2, property_type, source_portal, days_on_market, is_opportunity, opportunity_score) VALUES
('a0000000-0000-0000-0000-000000000001', 'Casa urgente en Samborondón Km 3', 195000, 780, 'Samborondón Km 3', 'Ciudad Celeste', 'Guayaquil', -2.1350, -79.8810, 3, 250, 'house', 'plusvalia', 45, true, 85),
('a0000000-0000-0000-0000-000000000001', 'Depto en Urdesa', 88000, 880, 'Urdesa Central', 'Urdesa', 'Guayaquil', -2.1800, -79.9100, 2, 100, 'apartment', 'olx', 12, false, 40),
('a0000000-0000-0000-0000-000000000001', 'Lote en Vía Daule Km 15', 32000, 64, 'Vía Daule Km 15', 'Daule', 'Guayaquil', -2.0500, -79.9500, 0, 500, 'land', 'marketplace', 60, true, 72),
('a0000000-0000-0000-0000-000000000001', 'Casa esquinera Ceibos', 320000, 1280, 'Los Ceibos', 'Ceibos', 'Guayaquil', -2.1700, -79.9300, 4, 250, 'house', 'properati', 5, false, 30);

-- 4. Demo Leads
INSERT INTO public.leads (workspace_id, whatsapp_number, user_name, budget_max, budget_info, desired_location, desired_type, buyer_type, lead_score, urgency, source, raw_message) VALUES
('a0000000-0000-0000-0000-000000000001', '0991234567', 'Carlos Mendoza', 300000, 'Crédito hipotecario pre-aprobado BanEcuador', 'Samborondón', 'house', 'end_user', 82, 'high', 'chat', 'Busco casa en Samborondón con piscina, tengo crédito pre-aprobado de $300k'),
('a0000000-0000-0000-0000-000000000001', '0987654321', 'María Fernández', 150000, 'Contado', 'Quito', 'apartment', 'investor', 68, 'medium', 'whatsapp', 'Me interesa invertir en departamentos en Quito, pago al contado'),
('a0000000-0000-0000-0000-000000000001', '0976543210', 'Roberto Arias', 500000, 'Sin definir', 'Guayaquil', 'land', 'developer', 45, 'low', 'referral', 'Soy constructor, busco terrenos grandes para proyecto residencial');

-- 5. Demo Deals
INSERT INTO public.deals (workspace_id, lead_id, property_id, title, stage, deal_value, notes, next_action) VALUES
('a0000000-0000-0000-0000-000000000001',
 (SELECT id FROM public.leads WHERE whatsapp_number = '0991234567' LIMIT 1),
 (SELECT id FROM public.properties WHERE title LIKE '%Samborondón%' LIMIT 1),
 'Carlos M. → Casa Samborondón', 'showing', 280000, 'Visita agendada para el sábado', 'Confirmar hora de visita'),
('a0000000-0000-0000-0000-000000000001',
 (SELECT id FROM public.leads WHERE whatsapp_number = '0987654321' LIMIT 1),
 (SELECT id FROM public.properties WHERE title LIKE '%González%' LIMIT 1),
 'María F. → Depto Quito', 'contacted', 115000, 'Envió WhatsApp con las fotos', 'Esperar respuesta');

-- 6. Demo Alerts
INSERT INTO public.smart_alerts (workspace_id, type, title, message) VALUES
('a0000000-0000-0000-0000-000000000001', 'opportunity', '🔥 Oportunidad detectada', 'Casa en Samborondón Km 3 está $85k por debajo del promedio de la zona. Lleva 45 días publicada — posible negociación agresiva.'),
('a0000000-0000-0000-0000-000000000001', 'lead', '📥 Nuevo lead capturado', 'Carlos Mendoza busca casa en Samborondón con crédito pre-aprobado de $300k. Lead Score: 82/100.'),
('a0000000-0000-0000-0000-000000000001', 'market', '📊 Cambio de precio detectado', 'La propiedad "Lote en Vía Daule Km 15" bajó de $38,000 a $32,000. Oportunidad de inversión.');
