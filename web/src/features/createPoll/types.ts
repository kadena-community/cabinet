export interface NewPoll {
  creator: string;
  title: string;
  description: string;
  bondId: string;
  options: string[];
}
