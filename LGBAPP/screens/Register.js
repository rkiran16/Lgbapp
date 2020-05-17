import React, { Suspense } from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  Image,
  KeyboardAvoidingView, AsyncStorage,
  TouchableWithoutFeedback, TouchableOpacity,
  BackHandler, Alert
} from "react-native";
import firebase from 'firebase';
import { Block, Text, theme } from "galio-framework";
import { Button, Icon, Input} from "../components";
import { Ldb, Odb } from "../actionable";
import { Images, argonTheme } from "../constants";

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {

  state = { 
    check: "", 
    eUser: false, 
    QQlabel:"NEW USER? CREATE ACCOUNT", 
    QQbtn:"CREATE ACCOUNT", 
    QQoption: "RETURNING? LOGIN",
    email: '', password: '', error: '', pwd:null,
    loading: false, ldbterms: null, 
    userInfo: ''
  };



  componentDidMount() {
    // AsyncStorage.clear();
    this._getExist();
    this._chkLink();
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }
  

  // componentWillMount() {
  //   backHandle.remove();
  // }

  _chkLink = () => {
    // const { navigation } = this.props;
    // const linkExist = navigation.getParam('wtd', null);
    // console.log("Tiptoe: "+linkExist);
    // if(linkExist === 'logout'){
      firebase.auth().signOut()
    //}
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

  _showAlert = (title, mssg, opt) => {
    Alert.alert(
        title,
        mssg,
        [
          {text: 'OK', onPress: () => { opt }}
        ]
    );
    return true;
  }

  _navigatoApp = data => {
    if(data.terms === null || data.terms === '5d4df5dd4827' || data.terms === undefined) {
      this.props.navigation.navigate('Welcome');
    } else {
      this.props.navigation.navigate('Dashboard');
    }
  }

  _getExist = async () => {
    try {
      const value = await Ldb.fetchDataAsync('user');
      const result = await JSON.parse(value);
      if(value !== null) {
        return this.setState({email: result.profile.email !== null || undefined ? result.profile.email : '',
          eUser: true, QQlabel:"WELCOME BACK, LOGIN!", QQbtn:"SIGN IN", QQoption: "NEW USER? SIGNUP"})
      }
    } catch(error) {
      console.log(error);
    }
  }

  _storeLocal = (data) => {
    return Ldb.storeDataAsync({'user': JSON.stringify(data)})
  }

  //SUBMIT USER DATA
  fillUserRecord = (token) => {
    const body = {token:token}
    return Odb.postURL('m/user', body)
  };


  onAuthFail () {
    const { email } = this.state;
    this.setState({ error: '', loading: true });
    firebase.auth().sendPasswordResetEmail(email)
    .then(res =>{
      this.setState({loading:false, QQlabel: 'CHECK YOUR EMAIL. WE SENT YOU A LINK!'});
    }).catch(err => {
      this.setState({ loading:false, QQlabel: 'ERROR SENDING OUT A EMAIL. PLEASE TRY AGAIN!!'});
    });
  }

  onGoogleClick = () => { }

  onButtonPress = () => {
    this.setState({ error: '', loading: true });
    const { email, password } = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(res => {
        if(res.user.emailVerified === false){
          return firebase.auth().currentUser.sendEmailVerification()
          .then(firebase.auth().signOut())
          .then(this._showAlert('Verify Email', "We've sent you a email verification link."))
          .then(this.setState({password:null, loading: false, QQlabel: 'VERIFY YOUR EMAIL'}))
          .catch(err => {
            throw new Error(err);
          })
        } else {
          this.setState({QQlabel: "...Setting you up!", password:null});
          return firebase.auth().currentUser.getIdToken(true)
            .then(idToken => {
              if(!idToken){
                return firebase.auth().signOut()
                  .then(this.setState({password:null, loading: false, QQlabel: 'LOGIN CREDENTIAL ERROR'}))
                  .catch(err =>{
                    throw new Error(err);
                  })
              } else {
                return this.fillUserRecord(idToken)
                .then(result => {
                    if(result.status !== 200){
                      return firebase.auth().signOut()
                        .then(this.setState({password:null, loading: false, QQlabel: 'SERVER ERROR, TRY AGAIN!'}))
                        .then(this._showAlert('Validation Error', "We have trouble validating you. Please try again!!!"))
                        .catch(err => {
                          this.setState({ QQlabel: err.message}); 
                          this._showAlert('Login Failed', err.message);
                        })
                    } else {
                      this.setState({QQlabel: "...Almost done. Thank you!"});
                      return result.json()
                        .then(reslt => {
                          if(!reslt){
                            return firebase.auth().signOut()
                              .then(this.setState({password:null, loading: false, QQlabel: 'SERVER ERROR, TRY AGAIN!'}))
                              .then(this._showAlert('Validation Error', "We have trouble validating you. Please try again!!!"))
                              .catch(err => {
                                this.setState({ QQlabel: err.message}); 
                                this._showAlert('Login Failed', err.message);
                              })
                          } else {
                            return this._storeLocal(reslt)
                              .then(resl => {
                                this.setState({QQlabel: "Done. Thank you!!"})
                                return this._navigatoApp(reslt);
                              })
                              .catch(err => {
                                this.setState({ QQlabel: err.message}); 
                                this._showAlert('Login Failed', err.message);
                              })
                          }
                        })
                    }
                  })
              }
            })
        }
      })
      .catch(err => {
        this.setState({password:null, loading: false, QQlabel: 'AUTHENTICATION FAILED!', check:null}); 
        this._showAlert('Login Failed', err.message);
    });
  }

  _signUPFn = () => {
    this.setState({ error: '', loading: true });
    const { email, password } = this.state;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(resl => {
        if(!resl){
          return this.setState({password:null, loading: false, QQlabel: 'AUTHENTICATION FAILED!', QQoption: "RETURNING? LOGIN"})
            .then(this._showAlert('Validation Error', "Login Failed. Please Try Again!!!"))
            .catch(err => {
              this.setState({ QQlabel: err.message}); 
              this._showAlert('Login Failed', err.message);
            })
        } 
        else {
          return firebase.auth().currentUser.sendEmailVerification()
          .then(this.setState({password:null, loading: false, QQlabel: 'VERIFY YOUR EMAIL'}))
          .then(firebase.auth().signOut())
          .then(this._showAlert('Verify Email', "We've sent you a email verification link."))
          .then (res => {
            if(res){
              this._showAlert('Verify Email', "We've sent you a email verification link.");
              return firebase.auth().signOut();
            }
          })
          .catch(err => {
            throw new Error(err);
          })
        }
      })
      .catch(err => {
        this.setState({password:null, loading: false, QQlabel: err.message}); 
        this._showAlert('Login Failed', err.message);
      })
  }

  renderButton() {
    if(this.state.QQlabel === "AUTHENTICATION FAILED!"){
      return (
        <Button style={{...styles.createButton, width:width}} onPress={this.onAuthFail.bind(this)}>
          <Text bold size={14} color={argonTheme.COLORS.ICON}>
            RESET PASSWORD
          </Text>
        </Button>
      );
    }
    if (this.state.loading) {
      return <Image
      source={Images.loading}
      style= {styles.loading}
      />
    }
    return (
      <Button style={styles.createButton} onPress={() => {
        this.state.eUser === true ? this.onButtonPress() : this._signUPFn()
      }}>
        <Text bold size={18} color={argonTheme.COLORS.ICON}>
        {this.state.QQbtn}
        </Text>
      </Button>
    );
  }

  allOptions = (value) => {
    if(value === "resette"){
      this.setState({check: 'register'});
    } else if(value === "goBack") {
      this.setState({check: 'logout', QQlabel:"WELCOME BACK"}, () =>{
        this._getExist();
        this.toggleSwitch();
      });
    } else if(value==='resets') {
      this.setState({check: 'logout'}, () =>{
        this._getExist();
      });
    }
  }

  toggleSwitch = () => {
    this.state.eUser===true ? this.setState({eUser: false, QQlabel:"NEW USER? CREATE ACCOUNT", QQbtn:"CREATE ACCOUNT", QQoption: "RETURNING? LOGIN"})
    : this.setState({eUser: true, QQlabel:"WELCOME BACK", QQbtn:"SIGN IN", QQoption: "NEW USER? SIGNUP"})
  }

  renderOpt = () => {
    if(this.state.QQlabel === "AUTHENTICATION FAILED!"){
      return(
          <Block>
                <Block middle style={{...styles.registerContainer, height: height <= 699 ? height*0.46 : height * 0.36,}}>
                  <Block flex middle>
                    <Block flex={0.4} middle>
                      <Text color={argonTheme.COLORS.WHITE} size={12}>
                        {this.state.QQlabel}
                      </Text>
                    </Block>
                    <Block middle style={{ flex: 1.6 }}>
                      <KeyboardAvoidingView
                        behavior="padding"
                        enabled
                        style={{ justifyContent:"center", alignContent:"center" }}
                      >
                        <Block flex middle style={{marginLeft: 10, marginBottom: 15,justifyContent:"center", alignContent:"center", width:width*0.93 }}>
                          <Input
                            autoCorrect = {false}
                            fontSize={18}
                            value = {this.state.email}
                            onChangeText={email => this.setState({ email })}
                            color={argonTheme.COLORS.WHITE}
                            style={{backgroundColor: 'transparent', borderColor:argonTheme.COLORS.WHITE, borderBottomWidth:1.4, fontWeight:"400", width:width*0.92}}
                            underlineColorAndroid = "transparent"
                            borderless
                            placeholder="Email"
                            autoCapitalize = "none"
                            placeholderTextColor={argonTheme.COLORS.WHITE}
                            iconContent={
                              <Icon
                                size={28}
                                color={argonTheme.COLORS.WHITE}
                                name="user"
                                family="EvilIcons"
                                style={{...styles.inputIcons, fontWeight:"700"}}
                              />
                            }
                          />
                        </Block>
                        
                        <Block row style={{width:width, justifyContent:"space-between", alignItems:"center"}}>
                          <Button style={{width:width, elevation: 0}}
                            color="transparent"
                            onPress={() => this.allOptions('resets')}
                            >
                            <Text color={argonTheme.COLORS.WHITE} 
                              size={14} style={{ fontWeight: "800" }}>
                                TRY AGAIN? PRESS HERE
                            </Text>
                          </Button>
                        </Block>
                        <TouchableOpacity style={{width:width}}>
                          {this.renderButton()}
                        </TouchableOpacity>
                      </KeyboardAvoidingView>
                    </Block>
                  </Block>
                </Block>
          </Block>    
      )
    }
    if(this.state.check === 'logout') {
        return(
            <Block>
                  <Block style={styles.registerContainer}>
                    <Block flex>
                      <Block flex={0.26} middle>
                        <Text color={argonTheme.COLORS.ICON} size={12}>
                          {this.state.QQlabel}
                        </Text>
                      </Block>
                      <Block flex center>
                        <KeyboardAvoidingView
                          style={{ flex: 1 }}
                          behavior="padding"
                          enabled
                        >
                          <Block style={{flex: 2.3}} center>
                            <Block width={width * 0.8} style={{ flex: 1.05 }}>
                              <Input
                                autoCorrect = {false}
                                autoCapitalize = "none"
                                fontSize={18}
                                value = {this.state.email}
                                onChangeText={email => this.setState({ email })}
                                color={argonTheme.COLORS.WHITE}
                                style={{backgroundColor: 'transparent', borderColor:argonTheme.COLORS.WHITE, borderBottomWidth:1.4, fontWeight:"400"}}
                                underlineColorAndroid = "transparent"
                                borderless
                                placeholder="Email"
                                placeholderTextColor={argonTheme.COLORS.WHITE}
                                iconContent={
                                  <Icon
                                    size={28}
                                    color={argonTheme.COLORS.WHITE}
                                    name="user"
                                    family="EvilIcons"
                                    style={{...styles.inputIcons, fontWeight:"700"}}
                                  />
                                }
                              />
                            </Block>
                            <Block width={width * 0.8} style={{ flex: 1.05 }}>
                              <Input
                                value={this.state.password}
                                onChangeText={password => this.setState({ password })}                  
                                fontSize={18}
                                color={argonTheme.COLORS.WHITE}
                                style={{backgroundColor: 'transparent', borderColor:argonTheme.COLORS.WHITE, borderBottomWidth:1.4}}
                                underlineColorAndroid = "transparent"
                                password
                                borderless
                                placeholder="Password"
                                placeholderTextColor={argonTheme.COLORS.WHITE}
                                iconContent={
                                  <Icon
                                    size={28}
                                    color={argonTheme.COLORS.WHITE}
                                    name="lock"
                                    family="EvilIcons"
                                    style={{...styles.inputIcons, fontWeight:"700"}}
                                  />
                                }
                              />
                            </Block>
                            <Block row  style={{ flex: 0.6 }} width={width * 0.8} space="around" justifyContent="center">
                              <Button style={{padding: 1, width:((width * 0.8)/2.2), elevation: 0}}
                                color="transparent"
                                onPress={() => {
                                  this.toggleSwitch()} }
                                >
                                <Text color={argonTheme.COLORS.WHITE} 
                                  size={14} style={{ fontWeight: "800" }}>
                                    {this.state.QQoption}
                                </Text>
                              </Button>
                              <Text bold style={{
                                  color: argonTheme.COLORS.WHITE,
                                  fontSize: 16, alignSelf:"center", fontWeight:"500"
                                }}>|</Text>

                              <Button style={{padding: 2, elevation:0, width:((width * 0.8)/2.2)}}
                                color="transparent"
                                onPress={() => {
                                  this.allOptions("resette")} }
                              >
                                <Text color={argonTheme.COLORS.WHITE} 
                                  size={14} style={{ fontWeight: "800" }}>
                                    QUICK SIGNUP
                                </Text>
                              </Button>
                            </Block>
                          </Block>
                          <Block middle style={{ flex: 0.56 }}>
                            {this.renderButton()}
                          </Block>
                        </KeyboardAvoidingView>
                      </Block>
                    </Block>
                  </Block>
            </Block>    
        )
    } else {
        return (
            <Block>
                <Block style={styles.signupContainer}>
                  <Block flex>
                    <Block row flex middle style={{
                            borderTopWidth: StyleSheet.hairlineWidth, paddingVertical:2,
                            borderColor: argonTheme.COLORS.GRADIENT_START, 
                            backgroundColor:'rgba(107,36,170,0.6)', alignItems:'center', justifyContent:'center'}}>
                        <Text color={argonTheme.COLORS.SECONDARY} size={14}>
                          HOW WILL YOU LIKE TO SIGN UP?
                        </Text>
                      </Block>
                    <Block row center style={{marginTop: 25}} >
                      <Button style={{ ...styles.socialButtons, marginRight: 40 }} 
                      onPress={() => { this.onGoogleClick() }}>
                          <Block row>
                            <Image
                              source={ Images.iconG }
                              style={styles.xocialIcon}
                            />
                            <Text style={styles.socialTextButtons}>GOOGLE</Text>
                          </Block>
                        </Button>
                        <Button style={styles.socialButtons}>
                          <Block row>
                            <Image
                              source={ Images.iconF }
                              style={{...styles.xocialIcon, marginRight: 3}}
                            />
                            <Text style={styles.socialTextButtons}>FACEBOOK</Text>
                          </Block>
                        </Button>
                    </Block>
                    <Block row center style={{marginTop: 25, marginBottom: 25}}>
                      <Button style={{ ...styles.socialButtons, marginRight: 40}}>
                        <Block row>
                          <Image
                              source={ Images.iconY }
                              style={styles.xocialIcon}
                            />
                          <Text style={styles.socialTextButtons}>YAHOO</Text>
                        </Block>
                      </Button>
                      <Button style={styles.socialButtons}>
                        <Block row>
                          <Image
                              source={ Images.iconT }
                              style={styles.xocialIcon}
                            />
                          <Text style={styles.socialTextButtons}>TWITTER</Text>
                        </Block>
                      </Button>
                    </Block>
                    <TouchableWithoutFeedback style={{border:0, backgroundColor:"transparent"}} onPress={ () => {
                      this.allOptions("goBack")} }>
                      <Block row flex middle style={{alignContent:'flex-end', 
                            borderTopWidth: StyleSheet.hairlineWidth, 
                            borderColor: argonTheme.COLORS.GRADIENT_START, 
                            elevation: 10, 
                            backgroundColor:'rgba(107,36,170,0.6)',
                            shadowColor: argonTheme.COLORS.BLACK,
                            shadowOffset: {
                              width: 1,
                              height: 4
                            },
                            shadowRadius: 8,
                            shadowOpacity: 0.3}}>
                        <Text color={argonTheme.COLORS.SECONDARY} size={14} style={{ marginRight: 5 }}>
                          USE THE LOGIN FORM
                        </Text>
                        <Text color={argonTheme.COLORS.SUCCESS} 
                              size={14} style={{ fontWeight: "800" }}
                              >
                          HERE
                        </Text>
                      </Block>
                    </TouchableWithoutFeedback>
                  </Block>
                </Block>
            </Block>    
        )
    }
  }

  render() {
    return (
      <Block flex middle style={{width, height, flex: 1}} >
        <StatusBar hidden />
        <ImageBackground
          source={Images.Onboarding}
          style={{ width, height, zIndex: 1 }}>
          <Block flex middle >
            {this.renderOpt()}
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height <= 700 ? height*0.54 : height * 0.42,
    backgroundColor: "rgba(244,245,247,0.4)",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  signupContainer: {
    width: width * 0.9,
    height: height <= 700 ? height*0.38 : height * 0.30,
    backgroundColor: "rgba(244,245,247,0.4)",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  socialConnect: {
    backgroundColor: 'rgba(94,114,228,0.7)',//argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: argonTheme.COLORS.PRIMARY,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    elevation: 8
  },
  loading: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14
  },
  xocialIcon: {
    height: 18, width:18, marginRight: 5
  },
  inputIcons: {
    marginRight: 12
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30
  },
  createButton: {
    width: width * 0.9,
    marginTop: 15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor:'rgba(244,245,247,0.7)',
    height: theme.SIZES.BASE * 3.5
  },
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red'
  }
});

export default Register;
