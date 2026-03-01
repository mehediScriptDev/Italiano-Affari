export interface UserProfile {
  id: number;
  email: string;
  name: string;
  activity: string;
  mobile: string;
  avatar: string;
  coupon_code: string;
  percentage: number;
  secret: string;
  secure: boolean;
  business_info: Record<string, string>;
  phone?: string;
}

export interface DecodedToken {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    activity: string;
    phone: string;
    avatar: string;
    coupon_code: string;
    percentage: number;
    info_business: string;
  };
  exp: number;
  iat: number;
}

export interface Order {
  id: number;
  name: string;
  total: number;
  earnings: number;
  commissions: Commission[];
  agent: string;
  date: string;
}

export interface Commission {
  type: "direct" | "affiliate" | "level2" | string;
  amount: number;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  orders: number;
  date: string;
  subagents: Agent[];
}

export interface PaymentAsset {
  id: number;
  iban: string;
  vatNumber: string;
  percentage: number;
  companyName: string;
  firstName: string;
  lastName: string;
  entityType: "company" | "individual";
  fiscalCode: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
}

export interface Discount {
  code: string;
  value: number;
}

export interface ChartPreviewData {
  total: number;
  data: Record<string, number> | number[];
  difference: string;
  trend: string;
}

export interface CreditData {
  available_credits: number;
  used_credits: number;
  total_credits: number;
}

export interface Coupon {
  id: number;
  code: string;
  value: number;
  quantity: number;
}

export interface TableColumn<T = Record<string, unknown>> {
  label: string;
  field: string;
  width?: string;
  maxWidth?: string;
  render?: (row: T) => React.ReactNode;
  renderCell?: (row: T) => React.ReactNode;
}
