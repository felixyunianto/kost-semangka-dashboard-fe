export type TPaginationParam = {
    page: number;
    limit: number;
}

export type TPagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number
}

export type TPaginated<T> = {
    items: T[];
    pagination: TPagination;
}