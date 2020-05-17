import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform,
  Dimensions, ActivityIndicator
} from 'react-native';
import { Image, Rating } from 'react-native-elements';
import { Block, Text } from 'galio-framework';
import { argonTheme } from "../constants";

const { width, height } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;

const Thumbnails = props => {
  const {imgUrl, theight, twidth, onSelects, label, big} = props;
  let TouchableCmp = TouchableOpacity;

  if (Platform.OS === 'android' && Platform.Version >= 5) {
    TouchableCmp = TouchableNativeFeedback;
  }
  const thumbStyles = [
    styles.thumb,
    twidth && { width: (width - 48 - 32) / 2.8 },
    theight && { height: (width - 48 - 32) / 2.8 },
    big && { height: 65, width: 100 },
  ];
  return (
    <TouchableCmp onPress={onSelects} useForeground>
        <Block style={{ flexWrap: "wrap", marginBottom: 10 }}>
            <Image
            source={{ uri: imgUrl }}
            resizeMode="cover"
            style={thumbStyles}
            PlaceholderContent={<ActivityIndicator />}
            />
            <Block style={{marginTop: 5, }}>
              <Block row space='between'>
                <Block style={{}}>
                  <Text style={{fontFamily:'bold', fontSize:10, color:argonTheme.COLORS.GRADIENT_END}}>Barbers</Text>
                </Block>
                <Block>
                  <Rating
                    type='star'
                    ratingColor='#6B24AA'
                    ratingCount={5}
                    imageSize = {10}
                    startingValue={3.5}
                    readonly
                  />
                </Block>
              </Block>
            </Block>
        </Block>
    </TouchableCmp>
  );
};

const styles = StyleSheet.create({
    thumb: {
        borderRadius: 4,
        marginVertical: 4,
        alignSelf: "center",
        width: thumbMeasure,
        height: thumbMeasure,
    },
});

export default Thumbnails;
