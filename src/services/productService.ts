/**
 * Service functions for product-related data operations.
 * Handles fetching the product catalog, resolving current pricing, and retrieving 
 * complete historical price logs directly from the Supabase price_history table.
 */
import { supabase } from '../lib/supabase';

export interface Product {
  prodcode: string;
  description: string;
  unit: string;
  current_price?: number;
  priceHistory?: { effdate: string; unitprice: number }[];
}



/** Shorthand: check if a specific permission is granted. */
const hasPermission = (permissions: Record<string, boolean>, id: string): boolean =>
  permissions[id] === true;

/**
 * Fetch all products with pricing.
 * Requires PROD_VIEW permission.
 */
export async function getProducts(
  permissions?: Record<string, boolean>,
  currentPage: number = 1,
  itemsPerPage: number = 10,
  searchQuery?: string
): Promise<{ data: Product[] | null; error: string | null; count: number }> {
  if (permissions && !hasPermission(permissions, 'PROD_VIEW')) {
    return { data: null, error: 'Permission denied: you do not have access to view products.', count: 0 };
  }

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase
    .from('products')
    .select('prodcode:product_code, description, unit', { count: 'exact' });

  // Server-side text search: filter the full dataset before pagination
  if (searchQuery && searchQuery.trim()) {
    const q = `%${searchQuery.trim()}%`;
    query = query.or(
      `product_code.ilike.${q},description.ilike.${q},unit.ilike.${q}`
    );
  }

  const { data: products, count, error: pError } = await query
    .order('product_code', { ascending: true })
    .range(from, to);

  if (pError) return { data: null, error: pError.message, count: 0 };

  const { data: prices, error: prError } = await supabase
    .from('price_history')
    .select('prodcode:product_code, unitprice:unit_price, effdate:effective_date')
    .order('effective_date', { ascending: false });

  if (prError) return { data: null, error: prError.message, count: 0 };

  const latestPrices: Record<string, number> = {};
  const historyMap: Record<string, { effdate: string; unitprice: number }[]> = {};
  for (const p of (prices || [])) {
    if (!historyMap[p.prodcode]) historyMap[p.prodcode] = [];
    historyMap[p.prodcode].push({ effdate: p.effdate, unitprice: p.unitprice });
    
    if (latestPrices[p.prodcode] === undefined) {
      latestPrices[p.prodcode] = p.unitprice;
    }
  }

  const enriched = (products || []).map(prod => ({
    ...prod,
    current_price: latestPrices[prod.prodcode] ?? 0,
    priceHistory: historyMap[prod.prodcode] || []
  }));

  return { data: enriched, error: null, count: count ?? 0 };
}

/**
 * Fetch price history for a specific product code.
 */
export async function getProductPriceHistory(productCode: string): Promise<{ data: { effdate: string; unitprice: number }[] | null; error: string | null }> {
  const { data: prices, error } = await supabase
    .from('price_history')
    .select('effdate:effective_date, unitprice:unit_price')
    .eq('product_code', productCode)
    .order('effective_date', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: prices, error: null };
}
