export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: RestaurantRow;
        Insert: RestaurantInsert;
        Update: RestaurantUpdate;
        Relationships: [];
      };
      menu_items: {
        Row: MenuItemRow;
        Insert: MenuItemInsert;
        Update: MenuItemUpdate;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
        Relationships: [];
      };
      inventory: {
        Row: InventoryRow;
        Insert: InventoryInsert;
        Update: InventoryUpdate;
        Relationships: [];
      };
      recipes: {
        Row: RecipeRow;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
        Relationships: [];
      };
      analytics: {
        Row: AnalyticsRow;
        Insert: AnalyticsInsert;
        Update: AnalyticsUpdate;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type RestaurantRow = {
  id: string;
  slug: string | null;
  name: string;
  cuisine: string | null;
  description: string | null;
  delivery_time: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  health_score: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export type RestaurantInsert = {
  id?: string;
  slug?: string | null;
  name: string;
  cuisine?: string | null;
  description?: string | null;
  delivery_time?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  health_score?: number | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type RestaurantUpdate = {
  id?: string;
  slug?: string | null;
  name?: string;
  cuisine?: string | null;
  description?: string | null;
  delivery_time?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  health_score?: number | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type CustomerRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  dietary_preferences: string[] | null;
  allergens: string[] | null;
  daily_calorie_target: number | null;
  daily_protein_target: number | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInsert = {
  id?: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  dietary_preferences?: string[] | null;
  allergens?: string[] | null;
  daily_calorie_target?: number | null;
  daily_protein_target?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type CustomerUpdate = {
  id?: string;
  user_id?: string | null;
  name?: string;
  email?: string;
  phone?: string | null;
  dietary_preferences?: string[] | null;
  allergens?: string[] | null;
  daily_calorie_target?: number | null;
  daily_protein_target?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type MenuItemRow = {
  id: string;
  restaurant_id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  sugar: number | null;
  sodium: number | null;
  allergens: string[] | null;
  image: string | null;
  badge: string | null;
  badge_icon: string | null;
  wellness_score: number | null;
  is_available: boolean | null;
  created_at: string;
  updated_at: string;
};

export type MenuItemInsert = {
  id?: string;
  restaurant_id: string;
  slug?: string | null;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  allergens?: string[] | null;
  image?: string | null;
  badge?: string | null;
  badge_icon?: string | null;
  wellness_score?: number | null;
  is_available?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type MenuItemUpdate = {
  id?: string;
  restaurant_id?: string;
  slug?: string | null;
  name?: string;
  description?: string | null;
  price?: number;
  category?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  allergens?: string[] | null;
  image?: string | null;
  badge?: string | null;
  badge_icon?: string | null;
  wellness_score?: number | null;
  is_available?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string | null;
  restaurant_id: string | null;
  status: string;
  subtotal: number;
  tax: number | null;
  delivery_fee: number | null;
  total_amount: number;
  total_calories: number | null;
  average_meal_score: number | null;
  delivery_address: string | null;
  delivery_time_estimate: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderInsert = {
  id?: string;
  order_number: string;
  customer_id?: string | null;
  restaurant_id?: string | null;
  status?: string;
  subtotal: number;
  tax?: number | null;
  delivery_fee?: number | null;
  total_amount: number;
  total_calories?: number | null;
  average_meal_score?: number | null;
  delivery_address?: string | null;
  delivery_time_estimate?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderUpdate = {
  id?: string;
  order_number?: string;
  customer_id?: string | null;
  restaurant_id?: string | null;
  status?: string;
  subtotal?: number;
  tax?: number | null;
  delivery_fee?: number | null;
  total_amount?: number;
  total_calories?: number | null;
  average_meal_score?: number | null;
  delivery_address?: string | null;
  delivery_time_estimate?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  sugar: number | null;
  sodium: number | null;
  allergens: string[] | null;
  created_at: string;
};

export type OrderItemInsert = {
  id?: string;
  order_id: string;
  menu_item_id?: string | null;
  item_name: string;
  unit_price: number;
  quantity?: number;
  total_price: number;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  allergens?: string[] | null;
  created_at?: string;
};

export type OrderItemUpdate = {
  id?: string;
  order_id?: string;
  menu_item_id?: string | null;
  item_name?: string;
  unit_price?: number;
  quantity?: number;
  total_price?: number;
  calories?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  allergens?: string[] | null;
  created_at?: string;
};

export type InventoryRow = {
  id: string;
  restaurant_id: string | null;
  ingredient_key: string | null;
  name: string;
  current_stock: number;
  threshold: number;
  initial_stock: number;
  unit: string;
  status: string | null;
  warning: string | null;
  cost_per_unit: number | null;
  created_at: string;
  updated_at: string;
};

export type InventoryInsert = {
  id?: string;
  restaurant_id?: string | null;
  ingredient_key?: string | null;
  name: string;
  current_stock?: number;
  threshold?: number;
  initial_stock?: number;
  unit?: string;
  status?: string | null;
  warning?: string | null;
  cost_per_unit?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type InventoryUpdate = {
  id?: string;
  restaurant_id?: string | null;
  ingredient_key?: string | null;
  name?: string;
  current_stock?: number;
  threshold?: number;
  initial_stock?: number;
  unit?: string;
  status?: string | null;
  warning?: string | null;
  cost_per_unit?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type RecipeRow = {
  id: string;
  menu_item_id: string;
  inventory_id: string;
  quantity_required: number;
  unit: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeInsert = {
  id?: string;
  menu_item_id: string;
  inventory_id: string;
  quantity_required?: number;
  unit?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RecipeUpdate = {
  id?: string;
  menu_item_id?: string;
  inventory_id?: string;
  quantity_required?: number;
  unit?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AnalyticsRow = {
  id: string;
  restaurant_id: string | null;
  date: string;
  total_orders: number | null;
  revenue: number | null;
  average_meal_health_score: number | null;
  calories_served: number | null;
  popular_dish: string | null;
  healthy_meal_percent: number | null;
  unhealthy_meal_percent: number | null;
  average_customer_satisfaction: number | null;
  insights: Json | null;
  metrics_payload: Json | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsInsert = {
  id?: string;
  restaurant_id?: string | null;
  date?: string;
  total_orders?: number | null;
  revenue?: number | null;
  average_meal_health_score?: number | null;
  calories_served?: number | null;
  popular_dish?: string | null;
  healthy_meal_percent?: number | null;
  unhealthy_meal_percent?: number | null;
  average_customer_satisfaction?: number | null;
  insights?: Json | null;
  metrics_payload?: Json | null;
  created_at?: string;
  updated_at?: string;
};

export type AnalyticsUpdate = {
  id?: string;
  restaurant_id?: string | null;
  date?: string;
  total_orders?: number | null;
  revenue?: number | null;
  average_meal_health_score?: number | null;
  calories_served?: number | null;
  popular_dish?: string | null;
  healthy_meal_percent?: number | null;
  unhealthy_meal_percent?: number | null;
  average_customer_satisfaction?: number | null;
  insights?: Json | null;
  metrics_payload?: Json | null;
  created_at?: string;
  updated_at?: string;
};

export type NotificationRow = {
  id: string;
  restaurant_id: string | null;
  customer_id: string | null;
  title: string;
  message: string;
  type: string;
  priority: string | null;
  category: string | null;
  severity: string | null;
  is_read: boolean | null;
  dedupe_key: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
};

export type NotificationInsert = {
  id?: string;
  restaurant_id?: string | null;
  customer_id?: string | null;
  title: string;
  message: string;
  type?: string;
  priority?: string | null;
  category?: string | null;
  severity?: string | null;
  is_read?: boolean | null;
  dedupe_key?: string | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
};

export type NotificationUpdate = {
  id?: string;
  restaurant_id?: string | null;
  customer_id?: string | null;
  title?: string;
  message?: string;
  type?: string;
  priority?: string | null;
  category?: string | null;
  severity?: string | null;
  is_read?: boolean | null;
  dedupe_key?: string | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
};
