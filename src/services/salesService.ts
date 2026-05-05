import { supabase } from '../lib/supabase';

export interface SaleDetail {
  product_code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

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

export async function getSales(custno?: string): Promise<{ data: SaleTransaction[] | null; error: string | null }> {
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

  const { data: sales, error } = await query;

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
    let total = 0;
    const details = (sale.sales_detail || []).map((detail: any) => {
      const unitPrice = latestPrices.get(detail.product_code) ?? 0;
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
}
