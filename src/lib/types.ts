export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  _id: string;
  name: string;
  price?: number;
  stock?: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: Category | string;
  images: string[];
  variants: ProductVariant[] | string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  // Update the orders type to match the backend response
  orders: {
    _id: string;
    address?: OrderAddress[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  variant: {
    _id: string;
    product: { _id: string; title: string };
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface OrderAddress {
  fullname: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string };
  items: OrderItem[];
  total: number;
  currency: string;
  status: string;
  address?: OrderAddress[];
  createdAt: string;
}
