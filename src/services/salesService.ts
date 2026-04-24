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
  // Query sales, join customers, employees, and salesdetail
  const { data, error } = await supabase
    .from('sales')
    .select(`
      transno,
      salesdate,
      custno,
      empno,
      customers!inner ( custname ),
      employees!inner ( firstname, lastname ),
      salesdetail ( quantity, unitprice )
    `)
    .order('salesdate', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Transform data
  const transformed = (data || []).map((sale: any) => {
    const total = (sale.salesdetail || []).reduce((acc: number, detail: any) => {
      return acc + (detail.quantity * detail.unitprice);
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
