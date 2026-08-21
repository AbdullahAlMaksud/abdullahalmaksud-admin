import { apiClient } from "./client";
import { Book, BookBundle, ApiResponse } from "./types";

export async function getAllBooks(): Promise<Book[]> {
  try {
    const res = await apiClient.get<ApiResponse<Book[]> | Book[]>("/api/v1/books/all");
    if (Array.isArray(res)) {
      return res;
    }
    if (res && "data" in res && Array.isArray(res.data)) {
      return res.data;
    }
  } catch {
    // Fallback to bundle books
  }

  // Fallback to bundle books
  try {
    const bundleRes = await apiClient.get<ApiResponse<BookBundle>>("/api/v1/books");
    if (bundleRes?.data?.books && Array.isArray(bundleRes.data.books)) {
      return bundleRes.data.books;
    }
  } catch {
    // Return empty
  }

  return [];
}

export async function getBooks(params?: {
  page?: number;
  limit?: number;
  recommended?: boolean;
}): Promise<{ data: Book[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const books = await getAllBooks();
  const limit = params?.limit || 50;
  const page = params?.page || 1;
  const total = books.length;

  return {
    data: books.slice((page - 1) * limit, page * limit),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getBookBundle(): Promise<ApiResponse<BookBundle>> {
  return apiClient.get<ApiResponse<BookBundle>>("/api/v1/books");
}

export async function updateBookBundle(
  data: Partial<BookBundle>
): Promise<ApiResponse<BookBundle>> {
  return apiClient.put<ApiResponse<BookBundle>>("/api/v1/books/bundle", data);
}

export async function createBook(
  data: Omit<Book, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Book>> {
  return apiClient.post<ApiResponse<Book>>("/api/v1/books", data);
}

export async function updateBook(
  id: string,
  data: Partial<Book>
): Promise<ApiResponse<Book>> {
  return apiClient.put<ApiResponse<Book>>(`/api/v1/books/${id}`, data);
}

export async function deleteBook(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/api/v1/books/${id}`);
}
