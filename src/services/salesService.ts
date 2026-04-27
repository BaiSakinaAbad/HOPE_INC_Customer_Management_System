import { supabase } from '../lib/supabase';

export interface SaleTransaction {
  transno: string;
  salesdate: string;
  custno: string;
  empno: string;
  customerName: string;
  employeeName: string;
  total: number;
}

export async function getSales(): Promise<{ data: SaleTransaction[] | null; error: string | null }> {
  const { data: sales, error } = await supabase
    .from('sales')
    .select(`
      transno:transaction_no,
      salesdate:sales_date,
      custno:customer_no,
      empno,
      customers!inner ( custname:customer_name ),
      employees!inner ( firstname, lastname ),
      sales_detail ( product_code, quantity )
    `)
    .order('sales_date', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const { data: prices, error: priceError } = await supabase
    .from('price_history')
    .select('product_code, unit_price, effective_date')
    .order('effective_date', { ascending: false });

  if (priceError) {
    return { data: null, error: priceError.message };
  }

  const latestPrices = new Map<string, number>();
  for (const price of prices ?? []) {
    if (!latestPrices.has(price.product_code)) {
      latestPrices.set(price.product_code, Number(price.unit_price));
    }
  }

  const transformed = (sales || []).map((sale: any) => {
    const total = (sale.sales_detail || []).reduce((acc: number, detail: any) => {
      const unitPrice = latestPrices.get(detail.product_code) ?? 0;
      return acc + (Number(detail.quantity) * unitPrice);
    }, 0);

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
    };
  });

  return { data: transformed, error: null };
}
