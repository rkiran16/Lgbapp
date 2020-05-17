import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Image, Platform, ImageBackground } from 'react-native';

const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);
const androidPhone = () => Platform.OS === 'android';
const { height, width } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;


export const AppParam = () => {
    const tolulomo = {height:height,
                        width:width,
                    thumbMeasure:thumbMeasure,
                    androidPhone:androidPhone,
                    iPhoneX:iPhoneX}
        return (
          tolulomo 
        )
}


  

