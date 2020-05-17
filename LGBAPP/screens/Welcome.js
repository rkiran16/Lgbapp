import React, { Component } from 'react';
import { ScrollView, Image, StatusBar, BackHandler, Alert } from 'react-native';
import { Text, Block } from "galio-framework";
import { Button } from "../components";
import { Util, Images, argonTheme } from "../constants";

const SLIDE_DATA = [
  { text: '<< Swipe', imagex: 'selCamera' },
  { text: ' ', imagex: 'selDate' },
  { text: ' ', imagex: 'selSelect' }
];

class WelcomeScreen extends Component {

  componentWillMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }
  onBackPress = () => {
    Alert.alert(
        'Confirm exit',
        'Do you want to exit LGB?',
        [
          {text: 'CANCEL', style: 'cancel'},
          {text: 'OK', onPress: () => {
            BackHandler.exitApp()
          }}
        ]
    );
    return true;
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }
    renderLastSlide = (index) => {
        if (index === SLIDE_DATA.length - 1) {
          return (
            <Button
              size='large'
              raised
              style={styles.buttonStyle}
              onPress={this.onSlidesComplete}
            ><Text style={styles.textStyle}>Start</Text></Button>
          );
        }
      }
    
      renderSlides = (slide, index) => {
        const img = Images[slide.imagex];
          return (
            <Block style={styles.containerStyle} key={slide.imagex} >
              <Image
                source={ img }
                style={styles.slideStyle}
              />
              <Block center style={styles.textContainer}>
                {index < SLIDE_DATA.length - 1 ?
                <Image
                    source={ Images.selSwipe }
                    style={{width: 100, height: 60}}
                />
                :
                this.renderLastSlide(index)
                }
              </Block>
            </Block>
          );
      }
      onSlidesComplete = () => {
        return this.props.navigation.navigate('CompleteProfile');
      }
    
    
      render() {
        const img = Images.selCamera;
        return (
          <ScrollView
            horizontal
            style={{ flex: 1, backgroundColor: argonTheme.COLORS.GRADIENT_START}}
            pagingEnabled
            showsHorizontalScrollIndicator = {false}
          >
            <StatusBar hidden />
            {SLIDE_DATA.map((slide, index) => this.renderSlides(slide, index))}
          </ScrollView>
        );
      }
}


const styles = {
    slideStyle: {
      flex: 1,
      width: Util.width,
      height: Util.height -40,
      zIndex: 1,
      paddingHorizontal: 20
    },
    containerStyle: {
      flex: 1,
      width: Util.width,
      height: Util.height,
      position:'relative',
      alignItems: 'center' 
    },
    textContainer: {
        position:'absolute', 
        bottom: 0, 
        marginBottom: -12,
        backgroundColor: 'transparent', 
        padding: 2, 
        flex: 1,
        width: '100%',
        height: 130,
        zIndex: 15,
    },
    textStyle: {
      fontSize: 20,
      color: 'white',
      fontFamily: "regular",
    },
    buttonStyle: {
      backgroundColor: argonTheme.COLORS.GRADIENT_START,
      marginTop: 15,
      width: Util.width * 0.5
    }
};

export default WelcomeScreen;