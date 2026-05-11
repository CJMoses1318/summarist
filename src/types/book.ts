export interface Book {
  id: string;
  author: string;
  title: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  totalRating?: number;
  averageRating?: number;
  keyIdeas?: number;
  type?: string;
  status?: "selected" | "recommended" | "suggested";
  subscriptionRequired: boolean;
  summary: string;
  tags?: string[];
  bookDescription?: string;
  authorDescription?: string;
}
