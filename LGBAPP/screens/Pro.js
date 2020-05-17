import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, StatusBar, Dimensions, Platform } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { PricingCard } from 'react-native-elements';
import { Images, argonTheme } from '../constants/';
import { HeaderHeight } from "../constants/utils";
const { height, width } = Dimensions.get('screen');

export default class Pro extends React.Component {
  async componentWillMount(){
    return await this.getItem()
  }

  getItem = async() => {
    const item = await this.props.navigation.getParam('item', null);
    console.log(item);
  }
  
  async componentDidUpdate(prevProps) {
    if(this.props !== prevProps){
      const item = await this.props.navigation.getParam('item', null);
      console.log(item);
    }
  }


  render() {

    return (
      <Block flex style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Block flex>
          <ImageBackground
            source={Images.Pro}
            style={{ flex: 1, height: height, width, zIndex: 1 }}
          >
           <ScrollView
            style={styles.padded} 
            showsVerticalScrollIndicator={false}>
                <PricingCard
                    color='#6B24AA'
                    title="Platinum Plan"
                    titleStyle={{fontFamily:'bold', fontSize:24}}
                    price="$0"
                    pricingStyle={{fontFamily:'bold'}}
                    info={['1 User', 'Basic Support', 'All Core Features']}
                    infoStyle={{fontFamily:'regular'}}
                    button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
                />
                <PricingCard
                    color='#6B24AA'
                    title="Gold Plan"
                    titleStyle={{fontFamily:'bold', fontSize:24}}
                    price="$0"
                    pricingStyle={{fontFamily:'bold'}}
                    info={['1 User', 'Basic Support', 'All Core Features']}
                    infoStyle={{fontFamily:'regular'}}
                    button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
                />
                <PricingCard
                    color='#6B24AA'
                    title="Silver Plan"
                    titleStyle={{fontFamily:'bold', fontSize:24}}
                    price="$0"
                    pricingStyle={{fontFamily:'bold'}}
                    info={['1 User', 'Basic Support', 'All Core Features']}
                    infoStyle={{fontFamily:'regular'}}
                    button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
                />
                <PricingCard
                    color='#6B24AA'
                    title="Elevated Plan"
                    titleStyle={{fontFamily:'bold', fontSize:24}}
                    price="$0"
                    pricingStyle={{fontFamily:'bold'}}
                    info={['1 User', 'Basic Support', 'All Core Features']}
                    infoStyle={{fontFamily:'regular'}}
                    button={{ title: 'GET STARTED', icon: 'flight-takeoff' }}
                />
            </ScrollView>
            </ImageBackground>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK,
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    flex:1, 
    overflow:"hidden",
    marginTop: Platform.OS === 'android' ? HeaderHeight-4:1,
  },
});
