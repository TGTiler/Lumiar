import { API_BASE_URL } from '../constants/theme';

export interface AppData {
  ID: string;
  NomeAPP: string;
  Versao: string;
  Descricao: string;
  descricao?: string;
  logo: string;
  img1: string;
  img2: string;
  url_apk: string;
  categoria: string;
  subcategoria: string;
  CategoriaSlug: string;
  SubcategoriaSlug: string;
  Destaque?: boolean;
  tags?: string[];
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

function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buscarAppsInteligente(query: string, listaApps: AppData[]): AppData[] {
  const q = normalizarTexto(query.trim());
  if (!q) return listaApps;

  const termosBusca = q.split(' ').filter(t => t.length > 0);

  const resultadosPonderados = listaApps.map(app => {
    let score = 0;
    const nomeApp = normalizarTexto(app.NomeAPP);
    const descApp = normalizarTexto(app.Descricao || app.descricao || '');
    const catApp = normalizarTexto(app.categoria || '');
    const catSlugApp = normalizarTexto(app.CategoriaSlug || '');
    const subCatApp = normalizarTexto(app.SubcategoriaSlug || '');
    const tagsApp = (app.tags || []).map(t => normalizarTexto(t));

    termosBusca.forEach(termo => {
      if (!termo) return;

      // 1. Match exato no nome
      if (nomeApp === termo) score += 100;
      // 2. Nome comeca com o termo
      else if (nomeApp.startsWith(termo)) score += 75;
      // 3. Nome contem o termo
      else if (nomeApp.includes(termo)) score += 50;

      // 4. Match nas Tags
      if (tagsApp.some(tag => tag.includes(termo))) score += 40;

      // 5. Match na Categoria ou Subcategoria
      if (catApp.includes(termo) || catSlugApp.includes(termo) || subCatApp.includes(termo)) score += 30;

      // 6. Match na Descricao
      if (descApp.includes(termo)) score += 10;
    });

    return { app, score };
  });

  return resultadosPonderados
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.app);
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
    return buscarAppsInteligente(query, apps);
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
