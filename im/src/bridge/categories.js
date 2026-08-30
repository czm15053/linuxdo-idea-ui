import { api } from "./api.js";

let categoriesCache = null; // [{id,name,slug,color}]

export async function loadCategories() {
  if (categoriesCache) return categoriesCache;
  try {
    const data = await api("/categories.json");
    categoriesCache = (data.category_list && data.category_list.categories) || [];
  } catch {
    categoriesCache = [];
  }
  return categoriesCache;
}
export function categoryById(id) {
  return (categoriesCache || []).find((c) => c.id === id) || null;
}
