import { API_BASE_URL } from '../constants/theme';

export interface AppData {
  ID: string;
  NomeAPP: string;
  Versao: string;
  Descricao: string;
  logo: string;
  img1: string;
  img2: string;
  url_apk: string;
  categoria: string;
  subcategoria: string;
  CategoriaSlug: string;
  SubcategoriaSlug: string;
  Destaque?: boolean;
}

export interface CategoryData {
  nome: string;
  slug: string;
  icon: string;
  color: string;
}

export interface SubCategoryData {
  nome: string;
  slug: string;
  parent: string;
}

export interface VersionData {
  Versao: string;
  Download: string;
  Changelog: string;
}

class ApiService {
  private static instance: ApiService;
  private appsCache: AppData[] | null = null;
  private categoriesCache: CategoryData[] | null = null;
  private versionCache: VersionData | null = null;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async fetchApps(): Promise<AppData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/apps.json`);
      if (!response.ok) throw new Error('Failed to fetch apps');
      const data = await response.json();
      this.appsCache = data;
      return data;
    } catch (error) {
      console.error('Error fetching apps:', error);
      return this.appsCache || [];
    }
  }

  async fetchCategories(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias.json`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      this.categoriesCache = data.categories;
      return data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.categoriesCache || [];
    }
  }

  async fetchSubCategories(): Promise<SubCategoryData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias.json`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      return data.subcategories || [];
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  async fetchVersion(): Promise<VersionData> {
    try {
      const response = await fetch(`${API_BASE_URL}/Version.json`);
      if (!response.ok) throw new Error('Failed to fetch version');
      const data = await response.json();
      this.versionCache = data;
      return data;
    } catch (error) {
      console.error('Error fetching version:', error);
      return this.versionCache || {
        Versao: '1.0.0',
        Download: '',
        Changelog: 'Versão inicial'
      };
    }
  }

  async searchApps(query: string): Promise<AppData[]> {
    const apps = await this.fetchApps();
    const lowerQuery = query.toLowerCase();

    const matches = apps.filter(app =>
      app.NomeAPP.toLowerCase().includes(lowerQuery) ||
      (app.Descricao || app.descricao || '').toLowerCase().includes(lowerQuery) ||
      app.categoria.toLowerCase().includes(lowerQuery)
    );

    // Sort by relevance: NomeAPP match first, then Descricao/categoria
    return matches.sort((a, b) => {
      const aName = a.NomeAPP.toLowerCase();
      const bName = b.NomeAPP.toLowerCase();
      const aNameMatch = aName.includes(lowerQuery);
      const bNameMatch = bName.includes(lowerQuery);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      // Both match name - prefer startsWith
      if (aNameMatch && bNameMatch) {
        const aStarts = aName.startsWith(lowerQuery);
        const bStarts = bName.startsWith(lowerQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }
      return 0;
    });
  }

  async getAppsByCategory(category: string): Promise<AppData[]> {
    const apps = await this.fetchApps();
    return apps.filter(app => app.categoria === category);
  }

  async getAppById(id: string): Promise<AppData | undefined> {
    const apps = await this.fetchApps();
    return apps.find(app => app.ID === id);
  }

  getFeaturedApps(apps: AppData[], limit: number = 5): AppData[] {
    const destaque = apps.filter(a => a.Destaque === true);
    if (destaque.length >= limit) {
      return destaque.slice(0, limit);
    }
    const remaining = limit - destaque.length;
    const recent = apps.slice(-remaining);
    return [...destaque, ...recent];
  }
}

export const api = ApiService.getInstance();
