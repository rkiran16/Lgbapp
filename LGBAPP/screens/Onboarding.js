import React from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar, Alert,
  Dimensions,
} from "react-native";
import { connect } from 'react-redux';
import * as dash from '../store/actions/dashboard';
import { Notifications } from 'expo';
import { Block, theme } from "galio-framework";
import Images from "../constants/Images";
import { Ldb } from "../actionable";
const { height, width } = Dimensions.get("screen");

class Onboarding extends React.Component {

  constructor(props){
    super(props);
    this.state={
      notification:{},
    }
    this.openSocket = this.openSocket.bind(this)
  };

  async componentWillMount() {
    Notifications.addListener((notification) => {
      const { data: {data}, origin,subtitle,title } = notification;
      if(origin === 'recieved'){
        Alert.alert(title, subtitle, [
          {
            text: 'Try Again',
            style: 'destructive',
            onPress: () => {
              return;
            }
          }
        ], {cancelable: true});
      }
    })
    return await this.openSocket();
  }

  openSocket = async() => {
    return await this.props.openSocket();
  }

  componentDidMount() {
    this._timingLoader();
    this._navigatoApp();
  }
  _timingLoader = () => {
      setTimeout(() => { 
      }, 5000)
  }

  _navigatoApp = async () => {
    let value, results;
    // await Ldb.removeData('user');
    // await Ldb.removeData('pushtoken');
    results = await Ldb.fetchDataAsync('user');
    if(!results){
      return this.props.navigation.navigate('Account')
    }

    value = await JSON.parse(results);

    if(value.stoken === null || value.stoken === undefined) {
      clearTimeout(this._timingLoader);
      return this.props.navigation.navigate('Account')
    }
    if(!value.terms || value.terms !== 'Good') {
      clearTimeout(this._timingLoader);
      return this.props.navigation.navigate('Welcome');
    } 
    clearTimeout(this._timingLoader);
    return this.props.navigation.navigate('Dashboard');
  }

  render() {
    return (
      <Block flex style={[styles.container, {justifyContent: 'center'}, {alignItems: 'center'}]}>
        <StatusBar hidden />
        <Block flex center>
        <ImageBackground
            source={Images.Onboarding}
            style={{ height, width, zIndex: 1 }}
          />
        </Block>
        <Block flex space="between" style={styles.logo}>
            <Block flex space="around" style={[{ zIndex: 2 }]}>
                <Image
                source={Images.loading}
                style= {styles.loading}
                />
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    position: "relative",
    bottom: theme.SIZES.BASE,
    zIndex: 2,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0
  },
  loading: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 60,
    zIndex: 2,
    position: 'relative',
    marginTop: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: '40%'
  }
});

const mapStateToProps = state => {
  return{
  }
}


export default connect(mapStateToProps,dash)(Onboarding);
