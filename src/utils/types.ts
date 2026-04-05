export type Review = {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon_name?: string;
  image_url?: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  additional_images?: string[];
  season?: string;
  in_stock?: boolean;
  sizes?: string[];
  colors?: string[];
  reviews?: Review[];
  created_at: string;
};
