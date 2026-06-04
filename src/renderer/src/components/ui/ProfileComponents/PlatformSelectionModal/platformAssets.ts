import nintendoLogo from '../../../../assets/images/platforms/nintendoLogo.png';
import pcLogo from '../../../../assets/images/platforms/pcgamerLogo.png';
import phoneLogo from '../../../../assets/images/platforms/phoneLogo.png';
import playstationLogo from '../../../../assets/images/platforms/playstationLogo.png';
import xboxLogo from '../../../../assets/images/platforms/xboxLogo.png';

export interface PlatformAsset {
  id: number;
  name: string;
  icon: string;
}

export const AVAILABLE_PLATFORMS: PlatformAsset[] = [
  { id: 1, name: 'PC', icon: pcLogo },
  { id: 2, name: 'PlayStation', icon: playstationLogo },
  { id: 3, name: 'Xbox', icon: xboxLogo },
  { id: 4, name: 'Nintendo', icon: nintendoLogo },
  { id: 5, name: 'Phone', icon: phoneLogo }
];

export const PLATFORM_LOGOS = AVAILABLE_PLATFORMS.reduce<Record<string, string>>((logos, platform) => {
  logos[platform.name.toLowerCase()] = platform.icon;
  return logos;
}, {});

export const resolvePlatformIcon = (platformName?: string | null, iconUrl?: string | null): string | undefined => {
  if (iconUrl?.trim()) {
    return iconUrl;
  }

  const normalizedName = platformName?.trim().toLowerCase();
  return normalizedName ? PLATFORM_LOGOS[normalizedName] : undefined;
};
