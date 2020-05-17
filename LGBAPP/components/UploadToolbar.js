import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, TouchableNativeFeedback, Platform } from 'react-native';
import { Block, Text} from "galio-framework";
import { Util } from "../constants/";
import { Foundation, Octicons } from '@expo/vector-icons';

let TouchableCmp = TouchableOpacity;

if (Platform.OS === 'android' && Platform.Version >= 5) {
  TouchableCmp = TouchableNativeFeedback;
}
const Textsy = 'Tap once Or Tap & hold to record';

class photoToolbar extends Component {
    render() {
        const { capturing, onCaptureIn, onCaptureOut, onLongCapture, onShortCapture, moreOptions, galleryPick, nPhotos } = this.props
        return(
        <Block row={false} space="between" flex={1}>
            <Block style={styles.bottomBar}>
                <TouchableCmp style={styles.bottomButton} onPress={moreOptions}>
                    <Block>
                        <Octicons name="kebab-horizontal" size={30} color="white"/>
                    </Block>
                </TouchableCmp>
                <TouchableOpacity style={{ flex: 0.6, alignItems:'center', justifyContent: 'center'}}
                    capturing
                    onPressIn={onCaptureIn}
                    onPressOut={onCaptureOut}
                    onLongPress={onLongCapture}
                    onPress={onShortCapture}>
                    <Block style={[styles.captureBtn, capturing && styles.captureBtnActive]}>
                        {capturing && <Block style={styles.captureBtnInternal} />}
                    </Block>
                </TouchableOpacity>
                <TouchableCmp style={styles.bottomButton} onPress={galleryPick}>
                    <Block>
                    <Foundation name="thumbnails" size={30} color="white" />
                    {nPhotos && <Block style={styles.newPhotosDot}/>}
                    </Block>
                </TouchableCmp>
            </Block>
            <Block style={{ flex: 1, marginBottom: 0, paddingBottom: 5, width: Util.width, alignItems: 'center'}}>
                <Text color='white' size={12}>{Textsy}</Text>
            </Block>
        </Block>
        );
    }
}

const styles = StyleSheet.create({
    bottomBar: {
        paddingBottom: Util.iPhoneX ? 25 : 5,
        backgroundColor: 'transparent',
        paddingHorizontal: 10,
        alignContent: 'center',
        justifyContent: 'space-around',
        flex: 2,
        flexDirection: 'row',
    },
    bottomButton: {
        flex: 0.25, 
        height: 58, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolbr: {
        height: 80,
        width: Util.width,
        paddingHorizontal: 20
    },
    captureBtn: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderRadius: 60,
        borderColor: "#FFFFFF",
    },
    captureBtnActive: {
        width: 80,
        height: 80,
    },
    captureBtnInternal: {
        width: 76,
        height: 76,
        borderWidth: 2,
        borderRadius: 76,
        backgroundColor: "red",
        borderColor: "transparent",
    },
    newPhotosDot: {
        position: 'absolute',
        top: 0,
        right: -5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4630EB'
      },
})

export default photoToolbar;