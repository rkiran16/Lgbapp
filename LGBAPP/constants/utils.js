import { Platform, StatusBar, Dimensions } from 'react-native';
import { theme } from 'galio-framework';

export const StatusHeight = StatusBar.currentHeight;
export const HeaderHeight = (theme.SIZES.BASE * 3.5 + (StatusHeight || 0));
export const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812);
export const { height, width } = Dimensions.get('screen');
export const androidPhone = () => Platform.OS === 'android';
//const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);
