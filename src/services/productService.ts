import { supabase } from '../lib/supabase';

export interface Product {
  prodcode: string;
  description: string;
  unit: string;
  current_price?: number;
  priceHistory?: { effdate: string; unitprice: number }[];
}

export async function getProducts(): Promise<{ data: Product[] | null; error: string | null }> {
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('prodcode:product_code, description, unit')
    .order('product_code', { ascending: true });

  if (pError) return { data: null, error: pError.message };

  const { data: prices, error: prError } = await supabase
    .from('price_history')
    .select('prodcode:product_code, unitprice:unit_price, effdate:effective_date')
    .order('effective_date', { ascending: false });

  if (prError) return { data: null, error: prError.message };

  const latestPrices: Record<string, number> = {};
  const historyMap: Record<string, { effdate: string; unitprice: number }[]> = {};
  for (const p of (prices || [])) {
    if (!historyMap[p.prodcode]) historyMap[p.prodcode] = [];
    historyMap[p.prodcode].push({ effdate: p.effdate, unitprice: p.unitprice });
    
    if (latestPrices[p.prodcode] === undefined) {
      latestPrices[p.prodcode] = p.unitprice;
    }
  }

  const enriched = products.map(prod => ({
    ...prod,
    current_price: latestPrices[prod.prodcode] ?? 0,
    priceHistory: historyMap[prod.prodcode] || []
  }));

  return { data: enriched, error: null };
}
