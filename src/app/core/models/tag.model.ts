export interface Tag {
    id: number;
    name: string;
}

export type TagCreatePayload = Omit<Tag, 'id'>;
export type TagUpdatePayload = Partial<Omit<Tag, 'id'>>;