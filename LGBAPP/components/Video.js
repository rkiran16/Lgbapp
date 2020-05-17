import React from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { Button, Block, theme } from 'galio-framework';
import { Video as Videos } from 'expo-av';
import Icon from './Icon';
const { width } = Dimensions.get('screen');

const Video = ({onLayout, isMuted, positionMillis, shouldPlay, source, onPress, sound}) => {
    return (
      <Block style={{paddingTop: theme.SIZES.BASE * 1.8, flex: 1, }} onLayout= {onLayout}>
        <Block flex card shadow style={styles.category}>
          <Videos 
            source = {{ uri: source }}
            repeat
            isMuted={isMuted}
            positionMillis = {positionMillis}
            shouldPlay = {shouldPlay}
            style = {[
              styles.imageBlock, {...styles.shadow,
              width: width,
              marginRight: 10,
              height: 252,
              position:'relative'
            }]}
            resizeMode="cover"
          />
          <Button shadowless style={{...styles.categoryBtn, position:'absolute', marginRight: 15}} onPress={onPress}
            >
            <Block row style={{...styles.categoryBtn, alignItems:'center'}}>
              <Block style={{marginRight:10}}>
                <Icon
                    name= {sound}
                    family="MaterialIcons"
                    size={25}
                    color= {'#999999'}
                />
              </Block>
            </Block>
          </Button>
        </Block>
      </Block>
    );
  }


const styles = StyleSheet.create({
  fakeContent: { 
    height: 0,
    backgroundColor: "transparent",
    borderTopWidth:0,
    alignItems: "center",
  },
  category: {  
    minHeight: 10,
    width: width,
  },
  categoryBtn: { 
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    width: (width - theme.SIZES.BASE * 2)/4
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.15,
    elevation: 5,
  },
});

export default Video;

