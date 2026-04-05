import { createClient } from '@supabase/supabase-js';
import { Review, Category, Product } from '../utils/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isDummyUrl = !supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseUrl.startsWith('http');

// Create a single supabase client for interacting with your database
export const supabase = !isDummyUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export type { Review, Category, Product };

export const mockCategories: Category[] = [
  { id: '1', name: 'Premier League', image_url: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg', created_at: new Date().toISOString() },
  { id: '2', name: 'La Liga', image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg', created_at: new Date().toISOString() },
  { id: '3', name: 'Serie A', image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg', created_at: new Date().toISOString() },
  { id: '4', name: 'Bundesliga', image_url: 'https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg', created_at: new Date().toISOString() },
  { id: '5', name: 'Ligue 1', image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue1_logo_2024.svg', created_at: new Date().toISOString() },
  { id: '6', name: 'National Teams', image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Globe_icon.svg', created_at: new Date().toISOString() },
  { id: '7', name: 'Retro Classics', image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Globe_with_meridians.svg', created_at: new Date().toISOString() },
  { id: '8', name: 'Rugby', image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Rugby_ball_icon.svg', created_at: new Date().toISOString() },
  { id: '9', name: 'Football Polo', image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Polo_shirt_icon.svg', created_at: new Date().toISOString() },
];

// Mock data for preview when Supabase is not configured
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Arsenal Home Jersey 23/24',
    description: 'Official Arsenal Home Jersey for the 2023/2024 season.',
    price: 35000,
    category: 'Premier League',
    season: '23/24',
    in_stock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Home'],
    image_url: 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?q=80&w=1000&auto=format&fit=crop',
    reviews: [
      { id: 'r1', user_name: 'John D.', rating: 5, comment: 'Great quality!', created_at: new Date().toISOString() }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Real Madrid Away Jersey 23/24',
    description: 'Official Real Madrid Away Jersey for the 2023/2024 season.',
    price: 38000,
    category: 'La Liga',
    season: '23/24',
    in_stock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Away'],
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1000&auto=format&fit=crop',
    reviews: [],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Retro Brazil 1998 Jersey',
    description: 'Classic retro jersey from the 1998 World Cup.',
    price: 45000,
    category: 'Retro Classics',
    season: '1998',
    in_stock: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Home'],
    image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop',
    reviews: [],
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Rugby World Cup Jersey',
    description: 'Official Rugby World Cup performance jersey.',
    price: 32000,
    category: 'Rugby',
    season: '2023',
    in_stock: true,
    sizes: ['L', 'XL', 'XXL'],
    colors: ['Standard'],
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1000&auto=format&fit=crop',
    reviews: [],
    created_at: new Date().toISOString()
  }
];
