import { supabase } from '../lib/supabase';

export interface Product {
  prodcode: string;
  description: string;
  unit: string;
  recordstatus: string;
  stamp: string;
  current_price?: number;
  priceHistory?: { effdate: string; unitprice: number }[];
}

export async function getProducts(): Promise<{ data: Product[] | null; error: string | null }> {
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('*')
    .order('prodcode', { ascending: true });

  if (pError) return { data: null, error: pError.message };

  const { data: prices, error: prError } = await supabase
    .from('pricehist')
    .select('prodcode, unitprice, effdate')
    .order('effdate', { ascending: false });

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
