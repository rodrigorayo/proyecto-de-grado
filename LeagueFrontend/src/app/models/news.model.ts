export interface News {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrl?: string;
  generatedAt: Date;
  matchId?: string;
}

export interface CreateNewsDto {
  title: string;
  body: string;
  summary?: string;
  imageUrl?: string;
}

export interface UpdateNewsDto {
  title: string;
  body: string;
  summary?: string;
  imageUrl?: string;
}
