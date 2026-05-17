/**
 * Sales Service
 * Handles data fetching and transformation for sales transactions and history..
 */
import { supabase } from '../lib/supabase';

/** Represents a single product line item in a sales transaction */
export interface SaleDetail {
  product_code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Represents a full sales transaction with its associated details and actor information */
export interface SaleTransaction {
  transno: string;
  salesdate: string;
  custno: string;
  empno: string;
  customerName: string;
  employeeName: string;
  total: number;
  details: SaleDetail[];
}

import { withCache } from './cache';

/** Shorthand: check if a specific permission is granted. */
const hasPermission = (permissions: Record<string, boolean>, id: string): boolean =>
  permissions[id] === true;

/**
 * Fetch all sales transactions, optionally filtered by customer.
 * Requires SALES_VIEW permission.
 */
export async function getSales(
  custno?: string,
  permissions?: Record<string, boolean>,
  searchQuery?: string
): Promise<{ data: SaleTransaction[] | null; error: string | null }> {
  if (permissions && !hasPermission(permissions, 'SALES_VIEW')) {
    return { data: null, error: 'Permission denied: you do not have access to view sales.' };
  }

  const cacheKey = custno ? `sales_${custno}` : 'sales_all';

  return withCache(cacheKey, async () => {
    // Fetch raw sales data with related table joins
    let query = supabase
      .from('sales')
      .select(`
        transno:transaction_no,
        salesdate:sales_date,
        custno:customer_no,
        empno,
        customers!inner ( custname:customer_name ),
        employees!inner ( firstname, lastname ),
        sales_detail ( product_code, quantity, products ( description ) )
      `)
      .order('sales_date', { ascending: false });


    if (custno) {
      query = query.eq('customer_no', custno);
    }

    if (searchQuery) {
      query = query.ilike('customers.customer_name', `%${searchQuery}%`);
    }

    const { data: sales, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    // Fetch price history to determine the unit price for each product
    const { data: prices, error: priceError } = await supabase
      .from('price_history')
      .select('product_code, unit_price, effective_date')
      .order('effective_date', { ascending: false });

    if (priceError) {
      return { data: null, error: priceError.message };
    }

    // Keep full price history sorted by effective_date descending for point-in-time lookups
    const sortedPrices = (prices ?? []).sort(
      (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime(),
    );

    // Transform raw Supabase response into SaleTransaction objects
    const transformed = (sales || []).map((sale: any) => {
      let total = 0;
      const saleDate = new Date(sale.salesdate);

      const details = (sale.sales_detail || []).map((detail: any) => {
        // Find the unit price that was active at the time of sale
        const matchingPriceEntry = sortedPrices.find(
          (p) =>
            p.product_code === detail.product_code &&
            new Date(p.effective_date) <= saleDate,
        );

        // Fallback: if no price predates this sale, use the earliest available price for the product
        const fallbackPriceEntry = !matchingPriceEntry
          ? [...sortedPrices]
            .reverse()
            .find((p) => p.product_code === detail.product_code)
          : undefined;

        const unitPrice = matchingPriceEntry
          ? Number(matchingPriceEntry.unit_price)
          : fallbackPriceEntry
            ? Number(fallbackPriceEntry.unit_price)
            : 0;

        const quantity = Number(detail.quantity) || 0;
        const totalPrice = quantity * unitPrice;
        total += totalPrice;

        const prod = Array.isArray(detail.products) ? detail.products[0] : detail.products;

        return {
          product_code: detail.product_code,
          description: prod?.description || detail.product_code,
          quantity,
          unitPrice,
          totalPrice,
        };
      });

      const emp = Array.isArray(sale.employees) ? sale.employees[0] : sale.employees;
      const cust = Array.isArray(sale.customers) ? sale.customers[0] : sale.customers;

      return {
        transno: sale.transno,
        salesdate: sale.salesdate,
        custno: sale.custno,
        empno: sale.empno,
        customerName: cust?.custname || sale.custno,
        employeeName: emp ? `${emp.firstname} ${emp.lastname}`.trim() : sale.empno,
        total,
        details,
      };
    });

    return { data: transformed, error: null };
  });
}
