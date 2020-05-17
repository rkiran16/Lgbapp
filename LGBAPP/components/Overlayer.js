import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Block, Text, theme } from 'galio-framework';
import { argonTheme } from '../constants';

const { width, height } = Dimensions.get("screen")


class Overlayer extends React.Component {
    render() {
        const { full, medium, small, smaller, btnPress, children } = this.props;
        const overlayerStyles = [
            full && styles.fullOverlay,
            medium && styles.mediumOverlay,
            small && styles.smallOverlay,
            smaller && styles.smallerOverlay,
          ];
        return(
            <Block style={styles.overlay}>
                <Block style={overlayerStyles}>
                    <Block style={{...styles.buttonBlock, alignItems:'flex-end'}}>
                        <TouchableOpacity onPress={btnPress}>
                            <Block row space='between' style={styles.button}>
                                <Ionicons
                                    style={{marginRight: 10}}
                                    name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                                    size={38}
                                    color='#999999'
                                />
                                <Block style={{alignItems:'center', justifyContent:'center'}}>
                                    <Text style={{fontFamily:'bold', fontSize: 20, color:'#999999'}}>CLOSE</Text>
                                </Block>
                            </Block>
                        </TouchableOpacity>
                    </Block>
                    <Block flex={1}>
                        {children}
                    </Block>
                </Block>
            </Block>
        )
    }
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        flex:1,
        elevation:5,
        borderTopColor: StyleSheet.hairlineWidth,
        borderColor: argonTheme.COLORS.PLACEHOLDER
    },
    fullOverlay: {
        width: width,
        height: Platform.OS==='android'? height*0.8 : height*0.85,
        backgroundColor: argonTheme.COLORS.WHITE
    },
    mediumOverlay: {
        width: width,
        height: height*0.7,
        backgroundColor: argonTheme.COLORS.WHITE
    },
    smallOverlay: {
        width: width,
        height: height*0.4,
        backgroundColor: argonTheme.COLORS.WHITE
    },
    smallerOverlay: {
        width: width,
        height: height*0.18,
        backgroundColor: argonTheme.COLORS.WHITE
    },
    buttonBlock:{
        width:width,
        height:'auto',
        alignItems:'flex-end',
        marginTop: 5,
    },
    button: {
        padding: 5,
        justifyContent:'center'
    }
})

export default Overlayer;