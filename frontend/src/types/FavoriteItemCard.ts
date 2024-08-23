import { Item } from "./Item";

export interface FavoriteItemCardProps {
  item: Item;
  onToggleFavorite: (itemId: number) => void;
  getFullImageUrl: (imageUrl: string) => string;
}
