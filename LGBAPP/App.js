import React from 'react';
import { Image } from 'react-native';
import Firebase from 'firebase';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Block, GalioProvider } from 'galio-framework';

import Screens from './navigation/Screens';
import { Images, articles, argonTheme } from './constants';

import editProfileReducer from './store/reducers/editProfile';
import productsReducer from './store/reducers/products';
import cartReducer from './store/reducers/cart';
import ordersReducer from './store/reducers/orders';
import postingReducer from './store/reducers/posting';
import dashboardReducer from './store/reducers/dashboard';

const rootReducer = combineReducers({
  profile: editProfileReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  posting: postingReducer,
  dashboard: dashboardReducer
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.ProfileBackground,
  Images.Logo,
  Images.Datepng,
  Images.loading,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo,
  Images.clothing,
  Images.flower,
  Images.food,
  Images.nopen,
  Images.ticket,
  Images.vacation,
  Images.shopping,
  Images.cat04,
  Images.iconF,
  Images.iconG,
  Images.iconT,
  Images.iconY,
  Images.selDate,
  Images.selCamera,
  Images.selSelect,
  Images.selSwipe,
  Images.clothings,
  Images.affangsoup,
  Images.banddancers,
  Images.barbers,
  Images.cakedesigners,
  Images.carpenters,
  Images.clubs,
  Images.decorators,
  Images.djmcs,
  Images.electrician,
  Images.eventsplanner,
  Images.eventsnearby,
  Images.graphicsdesigner,
  Images.grillfish,
  Images.handyman,
  Images.localrestaurantsfood,
  Images.masseuse,
  Images.painters,
  Images.peppersoup,
  Images.photography,
  Images.plumbers,
  Images.suyaspots,
  Images.trainings,
  Images.newintown, 
  Images.RewardCard
];

// cache product images
articles.map(article => assetImages.push(article.image));

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const fetchFonts = async () => {
  return Font.loadAsync({
    'regular': require('./assets/font/Ubuntu-Light.ttf'),
    'bold': require('./assets/font/Ubuntu-Regular.ttf'),
  })
};

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  }

  componentWillMount(){
    fetchFonts();
    Firebase.initializeApp({
      apiKey: "AIzaSyBSBOjf4VKzrCUF-d7UsbeZYYlq59WsOdY",
      authDomain: "authenticator-e17b5.firebaseapp.com",
      databaseURL: "https://authenticator-e17b5.firebaseio.com",
      projectId: "authenticator-e17b5",
      storageBucket: "authenticator-e17b5.appspot.com",
      messagingSenderId: "288175870815",
      appId: "1:288175870815:web:6a4c322853b6333cea9cea",
      measurementId: "G-ET9CZGZWF2"
    });
  }
  
  render() {
    if(!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Provider store={store}>
          <GalioProvider theme={argonTheme}>
            <Block flex>
              <Screens />
            </Block>
          </GalioProvider>
        </Provider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

}
