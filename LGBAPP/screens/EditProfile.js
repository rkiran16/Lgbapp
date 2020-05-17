import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Dimensions, TouchableOpacity, Image, Platform, Alert,
   StatusBar, ImageBackground, BackHandler, KeyboardAvoidingView } from "react-native";
import DatePicker from 'react-native-datepicker'
import { useSelector, useDispatch } from 'react-redux';
import * as profileActions from '../store/actions/editProfile';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment';
// Galio components
import { Block, Text, theme, Button as GaButton } from "galio-framework";

import { argonTheme, Images, Util } from "../constants/";
import { Button, FInput, Spinner } from "../components";
import { 
  Ionicons, EvilIcons
} from '@expo/vector-icons';


const { width, height } = Dimensions.get("screen");
const helpers = ['Tap the Camera', 'Tell us your name', 'Do you have a business?', 'Tap to Select Date of Birth', 'Enter your Country & Zip', 
                'Enter your State & City' ];


const EditProfile = props => {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState('Setting you up...');
  const [viewsType, setIsViewsType] = useState(0);
  const [photo, setIsPhoto] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [bizname, setBizname] = useState(null);
  const [dob, setDob] = useState(null);
  const [dobCheck, setDobCheck] = useState('Tap to select');
  const [countr, setCountr] = useState(null);
  const [statey, setStatey] = useState(null);
  const [zipcodes, setZipcodes] = useState(null);
  const [city, setCity] = useState(null);
  const [error, setError] = useState();
  const [dpError, setDpError] = useState();
  const country = useSelector(state => state.profile.country);
  const category = useSelector(state => state.profile.category);
  const dispatch = useDispatch();

  const rUpload = props.navigation.getParam('rUpload', null);
  if (rUpload && rUpload.length > 1) {
    Alert.alert('Profile Photo', 'Multiple photos not accepted for profile picture', [
      {
        text: 'Try Again',
        style: 'destructive',
        onPress: () => {
          props.navigation.navigate('Upload');
        }
      }
    ], {cancelable: false});
  }

  const showAlerts = (num) => Alert.alert('Input Missing', 'Provide the missing input and try again', [
    {
      text: 'Try Again',
      style: 'destructive',
      onPress: () => {
        return setIsViewsType(num);
      }
    }
  ], {cancelable: false});

  const formSubmitHandler = useCallback(async(data) => {
    const formDatas = new Object();

    if(data === 'OK') {
      setIsLoading(true);
      setIsLoadingContent('Submitting your info...');

      if(displayName === null) {
        setIsLoading(false);
        return showAlerts(1)
      }
      formDatas.photo = photo;
      formDatas.firstName = firstName;
      formDatas.lastName = lastName;
      formDatas.displayName = displayName;
      formDatas.bizname = bizname;
      formDatas.dob = dob;
      formDatas.country = countr;
      formDatas.state = statey;
      formDatas.zipcodes = zipcodes;
      formDatas.city = city;
      setIsLoading(false);
      navigation.navigate('CatSelect', { category: category, formData: formDatas})
      return;
    }
  }, [setIsLoading, setIsLoadingContent, navigation, photo, firstName, lastName, displayName, bizname, dob, countr, statey, zipcodes, city]);
  
  const onBackPress = useCallback(() => {
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
  });

  useEffect(() => {
    const backPress = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      backPress.remove();
    };
  }, [onBackPress])

  const checkDateOfBirth = useCallback(async val => {
    setIsLoading(true)
    setIsLoadingContent('...please wait')
    const currentDate = await new Date(moment().format('YYYY-MM-DD'));
    const postedDate = await new Date (val)
    const Subtracted = await ((((currentDate - postedDate)/ (1000 * 3600 * 24))/365) * 100/100);

    if(Subtracted <= 15) {
      setIsLoading(false)
      setDobCheck('Age too young, try again!')
      return 
    }
    setDob(val)
    setIsLoading(false)
    return
  }, [setDob])

  const loadCountry = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(profileActions.fetchCountry());
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, setIsLoading, setError]);

  useEffect(() => {
    loadCountry().then(() => {
      return
    });
  }, [dispatch, loadCountry]);

  //Submit Handler
  const submitHandler = useCallback(async (a,b) => {
    try {
      if (a === 'username') {
        if (displayName === null || displayName === '') {
          Alert.alert('Input Error!', `Please check the errors at ${b}.`, [
            { text: 'Okay' }
          ], {cancelable: false});
          return;
        }
        setDpError(null);
        setIsLoading(true);
        setIsLoadingContent('Checking Username...')
        await dispatch(
          profileActions.checkUsername(
            displayName
          )
        );
        setIsLoading(false);
        setIsViewsType(2)
      } 
    } catch (err) {
      setDpError(err.message);
      setDisplayName(null);
    }
    return;
  }, [dispatch, displayName, setDisplayName]);

  //Switcher
  const viewType = useCallback((val) => {
    const userPhoto = rUpload ? rUpload[0].uri : null;
    switch(val){
      case 0:
          return setIsViewsType(0);
      case 1:
          setIsPhoto(userPhoto);
          setIsViewsType(1);
          return
      case 2:
        setIsViewsType(2);
        return   
      case 3:
        setIsViewsType(3);
        return
      case 4:
        setIsViewsType(4);
        return
      case 5:
        setIsViewsType(5);
        return
      default: 
      return;
    }
  }, [rUpload]);

  //HEADER
  const renderText = () => {
    return (
      <Block flex style={{...styles.group, flex: 0.2}}>
        <Block style={{ paddingHorizontal: theme.SIZES.BASE }}>
          <Text bold size={26} style={[styles.title, styles.textFont]}>
            Let's Finish Up
          </Text>
          <Block row>
            <Text style={styles.textFont} color={argonTheme.COLORS.WHITE}>{helpers[viewsType]}</Text>
            <Text style={{color: argonTheme.COLORS.ERROR}}> *</Text>
          </Block>
        </Block>
      </Block>
    );
  };

  if (isLoading) {
    return (
        <Block style={{...styles.centered, backgroundColor: argonTheme.COLORS.GRADIENT_START }}>
            <Spinner label={isLoadingContent} style={{color:argonTheme.COLORS.WHITE}} color={argonTheme.COLORS.GRADIENT_END} />
        </Block>
    );
  }

  if (error) {
    return (
        <Block flex style={styles.errorStyles}>
            <Block flex>
            <ImageBackground
              source={Images.ProfileBackground}
              style={{ width, height, zIndex: 1 }}
            >
              <Block style={styles.centered}>
                  <Text size={20} style={{...styles.textFont, marginBottom:5}}>An error occurred!</Text>
                  <Button shadowless onPress={loadCountry} style={styles.errBtn}>
                  <Block row space="between">
                      <Text style={styles.textFont} size={16} color={ Platform.OS === 'android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
                  </Block>
                  </Button>
              </Block>
              </ImageBackground>
            </Block>
        </Block>
    );
  }

  const _photoUpload = () => {
    return (
      <Block flex style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -theme.SIZES.BASE * 4 }}>
        <Block style={{ paddingHorizontal: theme.SIZES.BASE}}>
          
            {rUpload !== null ? 
            <Block middle center >
              <TouchableOpacity onPress={() => {navigation.navigate('Upload')}}>
                <Block middle style={[styles.social, styles.shadow]}>
                <Image
                  source= {{ uri: rUpload[0].uri }}
                  style={styles.avatar}
                />
                </Block>
              </TouchableOpacity>
              <Block center>
                <Button style={{...styles.btnE, backgroundColor:'rgba(244,245,247,0.7)', marginTop: theme.SIZES.BASE * 2}} 
                  onPress={() => viewType(1)}>
                  <Text size={28} color={argonTheme.COLORS.ICON} style={styles.textFont}> Next</Text>
                </Button>
              </Block>
            </Block> 
            :
            <Block middle center >
              <TouchableOpacity onPress={() => navigation.navigate('Upload', {incomingRoute: navigation.state.routeName})}>
                <Block middle style={{...styles.social, ...styles.shadow, backgroundColor: argonTheme.COLORS.GRADIENT_START}}>
                <EvilIcons name="camera" size={theme.SIZES.BASE * 4.625} color={argonTheme.COLORS.WARNING} />
                </Block>
              </TouchableOpacity>
            </Block>
          }
        </Block>
      </Block>
    );
  };
  
  const nameInput = () => {
    return (
      <Block style={styles.formScreen}>
          <Block flex style={styles.groups}>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE }}>
              <FInput
                ww
                label = 'First Name'
                value={firstName !== null ? firstName.replace(/[^a-z,A-Z,\s]/g,''): ''}
                onChangeText={text => { setFirstName(text.replace(/[^a-z,A-Z,\s]/g,'')) }}
                autoCompleteType = "name"
                autoCapitalize = "words"
                returnKeyType="next"
              />
            </Block>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingTop: theme.SIZES.BASE * 3 }}>
              <FInput
                ww
                label = 'Last Name'
                value={lastName !== null ? lastName.replace(/[^a-z,A-Z,\s]/g,''): ''}
                onChangeText={text => { setLastName(text.replace(/[^a-z,A-Z,\s]/g,'')) }}
                autoCompleteType = "name"
                autoCapitalize = "words"
                returnKeyType= "next"
              />
            </Block>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingTop: theme.SIZES.BASE * 3 }}>
              <FInput
                ww
                label = {dpError ? 'User Name Exist!' : 'User Name'} 
                value={displayName !== null ? displayName.replace(/[^a-z,A-Z,0-9,-]/g,''): ''}
                onChangeText={text => { setDisplayName(text.replace(/[^a-z,A-Z,0-9,-]/g,'').toLowerCase()) }}
                autoCapitalize = "none"
                autoCorrect = {false }
                required = {true}
              />
            </Block>
            {
              firstName !== null && lastName !== null && firstName !== '' && lastName !== ''  && displayName !== '' && displayName !== null ?
              <Block center style={{marginTop: theme.SIZES.BASE}}>
                <Button style={styles.btnE} 
                  onPress={() => submitHandler('username', 'User Name Field')}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Next</Text>
                </Button>
              </Block>
              : 
              <Block center style={{marginTop: theme.SIZES.BASE}}>
                <Button style={styles.btnE} 
                  onPress={() => viewType(0)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Back</Text>
                </Button>
              </Block>
            }
          </Block >
      </Block>
    );
  }

  const countryZip = () => {
    let showCList = []
    country ? country.map(el => showCList.push({label: el.name, value: el._id, key:el._id })): null
    return (
      <Block style={{...styles.formScreen, marginTop: Platform.OS==='android' ? '54%':'70%'}} >
          <Block flex style={styles.groups}>
            <Block>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE, }}>
              <Block style={{ paddingVertical: 5, borderBottomWidth: .8, borderBottomColor: argonTheme.COLORS.BLACKS}}>
                <RNPickerSelect
                  useNativeAndroidPickerStyle={false}
                  textInputProps={{fontSize: 21}}
                  style={{...styles.inputSelect,
                  placeholder: {fontSize: 21, color: argonTheme.COLORS.BLACKS } }}
                  onValueChange={val => setCountr(val)}
                  items={showCList}
                  placeholder= {{label: 'Select Country', value: null}}
                  Icon={() => {
                    return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                    size={21} style={{color:argonTheme.COLORS.BLACKS}}  />;
                  }}
                />
              </Block>
            </Block>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingTop: theme.SIZES.BASE * 3 }}>
              <FInput
                ww
                label = 'Zip Code'
                value={zipcodes !== null ? zipcodes.replace(/[^0-9,-]/g,''): ''}
                onChangeText={text => { setZipcodes(text.replace(/[^0-9,-]/g,'')) }}
                min={0}
                keyboardType = { Platform.OS === 'android' ? "number-pad" : "numbers-and-punctuation" }
                returnKeyType = "next"
                textContentType = "postalCode"
              />
            </Block>
            </Block>
            {
              zipcodes !== null && zipcodes !== '' && countr !== null && countr !== '' ?
              <Block center style={{marginTop: theme.SIZES.BASE}}>
                <Button style={styles.btnE} 
                  onPress={() => viewType(5)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Next</Text>
                </Button>
              </Block>
              : 
              <Block center style={{marginTop: theme.SIZES.BASE}}>
                <Button style={styles.btnE} 
                  onPress={() => viewType(3)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Back</Text>
                </Button>
              </Block>
            }
          </Block >
      </Block>
    );
  }

  const stateCitySelect = () => {
    let showCList = []
    const showCSelect = countr ? country.find(cc =>
      cc._id === countr) : null
    showCSelect ? showCSelect.states.map(el => showCList.push({label: el.name, value: el._id, key:el._id })): null
    return (
      <Block style={{...styles.formScreen, marginTop: Platform.OS==='android' ? '54%':'70%'}}>
          <Block flex style={styles.groups}>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE}}>
              <FInput
                ww
                label = 'City'
                value={city !== null ? city.replace(/[^a-z,A-Z,0-9,-, \s]/g,''): ''}
                onChangeText={text => { setCity(text.replace(/[^a-z,A-Z,0-9,-, \s]/g,'')) }}
                returnKeyType = "next"
                autoCompleteType = "street-address"
              />
            </Block>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingTop: theme.SIZES.BASE * 3 }}>
              <Block style={{ paddingVertical: 5, borderBottomWidth: .8, borderBottomColor: argonTheme.COLORS.BLACKS}}>
                <RNPickerSelect
                  useNativeAndroidPickerStyle={false}
                  textInputProps={{ 
                  fontSize: 21, 
                  }}
                  style={{
                    ...styles.inputSelect,
                  placeholder: { 
                  fontSize: 21, 
                  color: argonTheme.COLORS.BLACKS }
                  }}
                  onValueChange={val => setStatey(val)}
                  items={showCList}
                  placeholder= {{label: 'Select State', value: null}}
                  Icon={() => {
                    return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                    size={21} style={{color:argonTheme.COLORS.BLACKS}}  />;
                  }}
                />
              </Block>
            </Block>
            {
              statey !== null && statey !== '' && city !== null && city !== '' ?
              <Block center style={{marginTop: theme.SIZES.BASE}}>
                <Button style={styles.btnE} 
                  onPress={() => formSubmitHandler('OK')}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Next</Text>
                </Button>
              </Block>
              : 
              <Block center style={{marginTop: theme.SIZES.BASE}}>
                <Button style={styles.btnE} 
                  onPress={() => viewType(4)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Back</Text>
                </Button>
              </Block>
            }
          </Block >
      </Block>
    );
  }

  const businessNames = () => {
    return (
      <Block style={{...styles.formScreen, marginTop: '70%'}}>
          <Block flex style={{...styles.groups, marginTop: '10%'}}>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE }}>
              <FInput
                ww
                label = 'Enter Business Name'
                value={bizname !== null ? bizname.replace(/[^a-z,A-Z,0-9,-, \s]/g,''): ''}
                onChangeText={text => { setBizname(text.replace(/[^a-z,A-Z,0-9,-, \s]/g,'')) }}
                autoCapitalize="words"
                autoCorrect={true}
              />
            </Block>
            {
              bizname !== null && bizname !== '' ?
              <Block center style={{marginTop: theme.SIZES.BASE*2}}>
                <Button style={styles.btnE} 
                  onPress={() => viewType(3)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Next</Text>
                </Button>
              </Block>
              : 
              <Block row center style={{marginTop: theme.SIZES.BASE * 2}}>
                <Button style={{...styles.btnE, marginRight: 5}} 
                  onPress={() => viewType(1)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Back</Text>
                </Button>
                <Button style={{...styles.btnE, marginLeft: 5}} 
                  onPress={() => viewType(3)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Skip</Text>
                </Button>
              </Block>
            }
          </Block >
      </Block>
    );
  }

  const dateSelect = () => {
    return (
      <Block style={{...styles.formScreen, marginTop: '70%'}}>
          <Block flex style={{...styles.groups, marginTop: '5%'}}>
            <Block style={{ paddingHorizontal: theme.SIZES.BASE }}>
            <DatePicker
              style={{width: '100%'}}
              customStyles={{
                placeholderText: {fontSize: 25, color: 'black'},
                dateText: {fontSize: 25, color: 'black'}
              }}
              date={dob}
              mode="date"
              placeholder={dobCheck}
              format="YYYY-MM-DD"
              minDate="1940-01-01"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              iconSource={Images.Datepng}
              //selected={date => setDob(date)}
              onDateChange={date => checkDateOfBirth(date)}
            />
            </Block>
            {
              dob !== null && dob !== '' ?
              <Block center style={{marginTop: theme.SIZES.BASE*2}}>
                <Button style={styles.btnE} 
                  onPress={() => viewType(4)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Next</Text>
                </Button>
              </Block>
              : 
              <Block center style={{marginTop: theme.SIZES.BASE * 2}}>
                <Button style={{...styles.btnE}} 
                  onPress={() => viewType(2)}>
                  <Text size={28} color={ Util.androidPhone ? argonTheme.COLORS.WHITE : argonTheme.COLORS.GRADIENT_START } style={styles.textFont}> Back</Text>
                </Button>
              </Block>
            }
          </Block >
      </Block>
    );
  }

  const screen = () => {
    switch (viewsType) {
      case 0:
        return _photoUpload();
      case 1:
        return nameInput();
      case 2:
        return businessNames();
      case 3:
        return dateSelect();
      case 4:
        return countryZip();
      case 5:
        return stateCitySelect();
      default:
        return;
    }
  }

  return (
    <Block flex center style={styles.mainScreen}>
      <StatusBar hidden />
      <ImageBackground
        source={Images.ProfileBackground}
        style={{ width, height, zIndex: 1 }}
      >
          {renderText()}
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        enabled>
          {screen()}
        </KeyboardAvoidingView>
      </ImageBackground>
    </Block>
  );
}



const styles = StyleSheet.create({
  mainScreen: {
    backgroundColor: argonTheme.COLORS.GRADIENT_START
  },
  formScreen: {
    backgroundColor: "rgba(244,245,247,0.4)",
    width: Util.width,
    marginTop: 70,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    // marginBottom: 0,
    flex: 1,
    zIndex: 5
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  errorStyles: {
    marginTop: Platform.OS === "android" ? -Util.HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
    backgroundColor: argonTheme.COLORS.GRADIENT_START
  },
  errBtn:{
    width: theme.SIZES.BASE * 8,
    backgroundColor: Platform.OS === "android" ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
  groups: {
    paddingTop: theme.SIZES.BASE * 2,
    marginBottom: theme.SIZES.BASE 
  },
  title: {
    paddingBottom: theme.SIZES.BASE,
    marginTop: 44,
    color: argonTheme.COLORS.WHITE
  },
  group: {
    paddingTop: theme.SIZES.BASE * .5,
    marginBottom: theme.SIZES.BASE * .6
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 2
  },
  btnE: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 15,
    fontSize: 20,
    backgroundColor: Util.androidPhone ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
    fontSize: 20
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10
  },
  social: {
    width: theme.SIZES.BASE * 10.5,
    height: theme.SIZES.BASE * 10.5,
    borderRadius: theme.SIZES.BASE * 5.25,
    justifyContent: "center"
  },
  avatar: {
    width: theme.SIZES.BASE * 10.5,
    height: theme.SIZES.BASE * 10.5,
    borderRadius: theme.SIZES.BASE * 5.25,
  },
  textFont: {
    fontFamily: 'regular'
  },
  inputSelect: {
    fontFamily: 'regular', 
    fontSize: 25, 
    color: 'black', 
    width: '100%'
  }
});

export default EditProfile;