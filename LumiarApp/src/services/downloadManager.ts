import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADS_KEY = '@lumiar_downloads';
const PROGRESS_KEY = '@lumiar_download_progress';

export interface DownloadState {
  status: 'idle' | 'downloading' | 'completed' | 'installing';
  progress: number;
  localUri: string | null;
}

class DownloadManager {
  private static instance: DownloadManager;
  private downloads: Map<string, DownloadState> = new Map();
  private listeners: Map<string, ((state: DownloadState) => void)[]> = new Map();

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  subscribe(appId: string, callback: (state: DownloadState) => void): () => void {
    const current = this.downloads.get(appId) || { status: 'idle', progress: 0, localUri: null };
    callback(current);

    if (!this.listeners.has(appId)) {
      this.listeners.set(appId, []);
    }
    this.listeners.get(appId)!.push(callback);

    return () => {
      const cbs = this.listeners.get(appId);
      if (cbs) {
        const idx = cbs.indexOf(callback);
        if (idx >= 0) cbs.splice(idx, 1);
      }
    };
  }

  private notify(appId: string) {
    const state = this.downloads.get(appId);
    const cbs = this.listeners.get(appId);
    if (state && cbs) {
      cbs.forEach(cb => cb({ ...state }));
    }
  }

  async getDownloadedIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveDownloadedId(appId: string): Promise<void> {
    const ids = await this.getDownloadedIds();
    if (!ids.includes(appId)) {
      ids.push(appId);
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(ids));
    }
  }

  async isDownloaded(appId: string): Promise<boolean> {
    const ids = await this.getDownloadedIds();
    return ids.includes(appId);
  }

  async downloadApk(appId: string, url: string): Promise<void> {
    this.downloads.set(appId, { status: 'downloading', progress: 0, localUri: null });
    this.notify(appId);

    const fileUri = `${FileSystem.documentDirectory}${appId}.apk`;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
          const progress = totalBytesExpectedToWrite > 0
            ? totalBytesWritten / totalBytesExpectedToWrite
            : 0;
          this.downloads.set(appId, { status: 'downloading', progress, localUri: null });
          this.notify(appId);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result) {
        this.downloads.set(appId, { status: 'completed', progress: 1, localUri: result.uri });
        this.notify(appId);
        await this.saveDownloadedId(appId);
      }
    } catch (error) {
      console.error('Download error:', error);
      this.downloads.set(appId, { status: 'idle', progress: 0, localUri: null });
      this.notify(appId);
    }
  }

  async installApk(appId: string): Promise<void> {
    const state = this.downloads.get(appId);
    if (!state?.localUri) return;

    this.downloads.set(appId, { ...state, status: 'installing' });
    this.notify(appId);

    try {
      const contentUri = await FileSystem.getContentUriAsync(state.localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/vnd.android.package-archive',
      });
    } catch (error) {
      console.error('Install error:', error);
      Alert.alert('Erro', 'Não foi possível abrir o instalador');
    } finally {
      this.downloads.set(appId, { status: 'completed', progress: 1, localUri: state.localUri });
      this.notify(appId);
    }
  }

  getDownloadState(appId: string): DownloadState {
    return this.downloads.get(appId) || { status: 'idle', progress: 0, localUri: null };
  }
}

import { Alert } from 'react-native';

export const downloadManager = DownloadManager.getInstance();
