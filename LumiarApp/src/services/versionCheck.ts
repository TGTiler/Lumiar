import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { api, VersionData } from './api';

const CURRENT_VERSION = '1.1.0';

export interface UpdateInfo {
  available: boolean;
  remoteVersion: string;
  currentVersion: string;
  changelog: string;
  downloadUrl: string;
}

function parseVersion(version: string): number[] {
  const cleaned = version.replace(/^v/i, '').trim();
  const parts = cleaned.split('.').map(p => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts;
}

function isNewerVersion(remote: string, local: string): boolean {
  const remoteParts = parseVersion(remote);
  const localParts = parseVersion(local);

  for (let i = 0; i < 3; i++) {
    if (remoteParts[i] > localParts[i]) return true;
    if (remoteParts[i] < localParts[i]) return false;
  }
  return false;
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    const versionData: VersionData = await api.fetchVersion();
    const remoteVersion = versionData.Versao || '1.0.0';
    const downloadUrl = versionData.Download || '';
    const changelog = versionData.Changelog || '';

    const available = isNewerVersion(remoteVersion, CURRENT_VERSION);

    return {
      available,
      remoteVersion,
      currentVersion: CURRENT_VERSION,
      changelog,
      downloadUrl,
    };
  } catch (error) {
    console.error('Error checking for update:', error);
    return {
      available: false,
      remoteVersion: CURRENT_VERSION,
      currentVersion: CURRENT_VERSION,
      changelog: '',
      downloadUrl: '',
    };
  }
}
