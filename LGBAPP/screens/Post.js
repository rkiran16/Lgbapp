import React from "react";
import {
  StyleSheet, SafeAreaView,
  Dimensions, Share, Alert,
  ScrollView, TouchableNativeFeedback,
  Image, FlatList, Keyboard, 
  ImageBackground, TouchableOpacity,
  Platform, KeyboardAvoidingView, TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { Block, Text, theme } from "galio-framework";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, EvilIcons } from '@expo/vector-icons';
import moment from 'moment';
import * as profileActions from '../store/actions/editProfile';
import * as postActions from '../store/actions/posting';
import * as dash from '../store/actions/dashboard';
import { Button, Spinner, FInput, RadioButton, Badges, Icon } from "../components";
import Thumbnails from "../components/Thumbnail";
import ColumnGrid from "../components/ColumnGrid";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import { Odb, Services } from "../actionable";


const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

let TouchableCmp = TouchableOpacity;

if (Platform.OS === 'android' && Platform.Version >= 5) {
    TouchableCmp = TouchableNativeFeedback;
}

const helpers = ['Put helper text here1', 'Upload multiple files', 'Do you have a business?', 'Put helper text here 4', 'Put helper text here 5', 
                'Put helper text here6','Put helper text here 7','Put helper text here 8','Drag your photo to desire location' ];

class Post extends React.Component {
    _isMounted = false;
  state = {
    isOverlayVisible:false,
    loading: false,
    loadingInfo: null,
    scrollingT: false,
    error: false,
    errs: null,
    errNum: null,
    sDescription: null,
    describe: false,
    viewsType: false,
    isRefreshing: false,
    options: false,
    optionValue: null,
    dType : 0,
    newPost : false,
    submitting: false,
    submitted: false,
    onImgScroll : false,
    postID:null,
    rUpload: null,
    ntitle: null,
    stype: null,
    nInterest: null,
    kategorization: null,
    nshort: null,
    nDesc: null,
    nprice: 0,
    nDiscount: 0,
    nlink: null,
    nButton: null,
    nAction: null,
    nTag: [],
    nStock: 0,
    nStockUnit: null,
    region: {
        longitude: -122,
        latitude: 37,
        longitudeDelta: 0.04,
        latitudeDelta: 0.09
    },
    newRegion: null,
    storeData:false,
    moreloader: false,
    deleted: false,
  }

  async componentWillMount() {
    this._isMounted = true;
    if (this._isMounted) {
        await this.props.navigation.setParams({ navHeaderFunction: this.navHeaderFunction });
        await this.photoUploading();
        await this.getNotification();
        if(!this.state.storeData){
            await this.getProfile();
        }
    }
    return;
  }

  async componentDidUpdate(prevProps) {
   
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  getNotification = async() => {
    const notifications = await Services.checkNotification();
    if(!notifications) {
        return;
    }
    console.log(notifications);
    return this.props.navigation.setParams({ notifications });
  }

  finalSubmit = async() => {
    const { postActions } = this.props
    if(!this.state.rUpload || this.state.rUpload.length <= 0){
        Alert.alert('No Picture', 'A picture is require for all post', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                this.setState({newPost: true, dType:1});
                return;
              }
            }
          ], {cancelable: false});
          return;
    }
    if(!this.state.ntitle) {
        Alert.alert('No Title', 'Title is require for all post', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                this.setState({newPost: true, dType:2});
                return;
              }
            }
        ], {cancelable: false});
        return;
    }
    if(!this.state.stype) {
        Alert.alert('Post Type Error', 'Post type ommitted', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                this.setState({newPost: true, dType:0});
                return;
              }
            }
        ], {cancelable: false});
        return;
    }

    if(!this.state.nInterest) {
        Alert.alert('Post Error', 'Post classification ommitted', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                this.setState({newPost: true, dType:0});
                return;
              }
            }
        ], {cancelable: false});
        return;
    }

    if(this.state.stype === 'Posted' && this.state.nInterest === null) {
        Alert.alert('Post Error', 'Post identification ommitted', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                this.setState({newPost: true, dType:0});
                return;
              }
            }
        ], {cancelable: false});
        return;
    }

    if(this.state.stype === 'Posted' && this.state.kategorization === null) {
        Alert.alert('Post Category', 'Post category ommitted', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                this.setState({newPost: true, dType:0});
                return;
              }
            }
        ], {cancelable: false});
        return;
    }

    this.setState({loading: true, error:false, errs: null, errNum:null, loadingInfo: 'Submitting your Info...', submitting: true, storeData:false, deleted:false})
    const formDatas = new Object();
    formDatas.postID = this.state.postID;
    formDatas.rUpload = this.state.rUpload;
    formDatas.ntitle =this.state.ntitle;
    formDatas.stype =this.state.stype;
    formDatas.kategorization =this.state.kategorization;
    formDatas.nshort =this.state.nshort;
    formDatas.nDesc =this.state.nDesc;
    formDatas.nprice =this.state.nprice;
    formDatas.nDiscount =this.state.nDiscount;
    formDatas.nlink =this.state.nlink;
    formDatas.nButton =this.state.nButton;
    formDatas.nAction =this.state.nAction;
    formDatas.nTag =this.state.nTag;
    formDatas.region =this.state.region; 
    formDatas.nInterest = this.state.nInterest;

    try {
        await this.props.postActions.createPost(formDatas);
        await this.setState({ postID:null,rUpload:null,ntitle:null,stype:null,kategorization:null,
            nshort:null,nDesc:null,nprice:0,nDiscount:0,nlink:null,nButton:null,nAction:null,
            nTag:[],region:null,nInterest:null,loading: false, submitting:false, submitted:true, newPost:false});  
        return;
    } catch(err) {
        console.log(err);
        this.setState({loading: false, error: true, errs: err.message, submitting:false, errNum: 2});
    }
  }

  deleteUserPost = async () => {
    const { _id } = this.state.optionValue;
    this.setState({loading: true, error:false, errs: null, errNum:null, loadingInfo: 'deleting post...', submitting: true, storeData:false})
    try {
        await this.props.postActions.deleteUserPosts(_id);
        await this.setState({loading: false, submitting:false, submitted:true, deleted:true, storeData:true});  
        return;
    } catch(err) {
        console.log(err);
        this.setState({loading: false, error: true, errs: err.message, submitting:false, errNum: 3, storeData:true});
    }
  }

  promoteThisPost = () =>{
    const item = this.state.optionValue;
    return this.setState({isOverlayVisible: !this.state.isOverlayVisible, options:!this.state.options, optionValue:null}, () => {
        this.props.navigation.navigate('Pro',{item:item});
    })
  }

  getlocal = async () => {
    this.setState({loading: true, loadingInfo: '...loading map, please wait'})
    let myLocale;
    const {checker} = await Location.hasServicesEnabledAsync()
    if(checker === false) {
        Alert.alert('Location Services', 'Location services turned off. Turn on location and try again', [
            {
              text: 'Try Again',
              style: 'destructive',
              onPress: () => {
                return this.getlocal();
              }
            },
            {text: 'CANCEL', style: 'cancel'}
          ], {cancelable: false});
    }
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if(status === 'denied') {
        Alert.alert('Location Denied', 'Turn on your location and try again', [
            {
                text: 'Try Again',
                style: 'destructive',
                onPress: () => {
                return this.getlocal();
                }
            },
            {text: 'CANCEL', style: 'cancel'}
            ], {cancelable: false});
    }

    if(status === 'granted') {
        if(Error) {
            await this.setState({loading:false, dType:8, newRegion: this.state.region});
        }

        if(Platform.OS==='ios') {
            myLocale = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            if(myLocale && myLocale.coords.latitude === null || myLocale && myLocale.coords.latitude === undefined) {
                Alert.alert('Location Granted', 'But you need to turn on location and try again', [
                    {
                      text: 'Try Again',
                      style: 'destructive',
                      onPress: () => {
                        return this.getlocal();
                      }
                    },
                    {text: 'CANCEL', style: 'cancel'}
                  ], {cancelable: false});
            }
            myLocale.coords.longitudeDelta = 0.045;
            myLocale.coords.latitudeDelta =  0.02;
            await this.setState({region: myLocale.coords, newRegion:myLocale.coords, loading:false, dType:8});
            return;
        } 
        if(Platform.OS === 'android') {
            myLocale = await Location.getCurrentPositionAsync({ accuracy: 6 });
            myLocale.coords.longitudeDelta = 0.045;
            myLocale.coords.latitudeDelta =  0.02;
            await this.setState({region: myLocale.coords, newRegion:myLocale.coords, loading:false, dType:8});
            return;
        }
    }
  }

  goFindPhoto = async () => {
    await this.setState({storeData: true});
    return this.props.navigation.navigate('Upload', 
    {incomingRoute: this.props.navigation.state.routeName, carriedData:{stype:this.state.stype, 
    nInterest:this.state.nInterest, kategorization:this.state.kategorization}})
  }

  manageNumbers = data => {
    parseFloat(3.14159.toFixed(2));
    if(data >=999999999999){
      let rData = data/1000000000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}T`;
    }
    else if(data >= 999999999) {
      let rData = data/1000000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}B`;
    }
    else if(data >= 999999) {
      let rData = data/1000000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}M`;
    }
    else if(data >= 999) {
      let rData = data/1000;
      rData = parseFloat(rData.toFixed(2));
      return `${rData}K`;
    }
    else if(data <= 999) {
      return data;
    }
  }

   // Switcher
   vType = (val) => {
    switch(val){
    case 0:
        return this.setState({dType:0});
    case 1:
        this.setState({dType:1});
        return
    case 2:
        this.setState({dType:2});
        return   
    case 3:
        this.setState({dType:3});
        return
    case 4:
        this.setState({dType:4});
        return
    case 5:
        this.setState({dType:5});
        return
    case 6:
        this.setState({dType:6});
        return
    case 7:
        this.setState({dType:7});
        return
    case 8:
        this.setState({dType:8});
        return
    default: 
    return;
    }
  };

  //Screens
  screen = () => {
    switch (this.state.dType) {
      case 0:
        return this.npostType();
      case 1:
        return this.photoUpload();
      case 2:
        return this.postTitle();
      case 3:
        return this.pricing();
      case 4:
        return this.generalDescrpt();
      case 5:
        return this.tagListings();
      case 6:
        return this.nbtnCatList();
      case 7:
        return this.actionList();
      case 8:
        // await this.getlocal();
        return this.locationSelect();
      default:
        return;
    }
  }

  backToPrevious = () => {
      const { stype, dType } = this.state;
    if(dType > 0) {
        if(stype === 'Found' && dType=== 8) {
            return this.setState({dType: 2});
        }
        return this.setState({dType: dType - 1});
    }
  }

  headerPress = async data => {
    return this.setState({options: true, optionValue: data})
  }
  headerPressCancel = async() => {
    return this.setState({options: false, optionValue: null})
  }

  viewType = () => {
    this.state.viewsType === true ? this.setState({viewsType:false}) : this.setState({viewsType:true});
    return;
  };

  navHeaderFunction = ()=> {
    return this.createNewPost();
  }

  createNewPost = () => {
    this.setState({newPost: true});
    this.screen(0);
    return;
  };

  closeNewPost = () => {
    this.setState({newPost: false});
    return;
  }

  pushTagSelect = async data => {
    const index = this.state.nTag.findIndex(x => x === data);
    if(index > -1) {
        return this.state.nTag;
    }
    const oldArray = this.state.nTag;
    await this.setState({nTag: [...oldArray, data]})
    return this.state.nTag;
  }

  removeTagSelect = async data => {
    const index = this.state.nTag.findIndex(x => x === data);
    if (index > -1) {
        const oldArray = this.state.nTag;
        await oldArray.splice(index, 1);
        await this.setState({nTag:oldArray});
        return this.state.nTag;
    }
    return;
  }

  photoUploading = async() => {
    const { navigation } = this.props
    const rUpload = await navigation.getParam('rUpload', null);
    const carriedData = await navigation.getParam('carriedData', null);
    if(rUpload === null) {
        return this.state.rUpload
    }
    if (rUpload !== null && rUpload.length > 4) {
        Alert.alert('Post Photo', 'Only four photos/videos are allowed', [
        {
            text: 'Try Again',
            style: 'destructive',
            onPress: () => {
                this.setState({storeData:true}, () => {
                    navigation.navigate('Upload', 
                    {incomingRoute: this.props.navigation.state.routeName, carriedData:{stype:carriedData.stype, 
                    nInterest:carriedData.nInterest, kategorization:carriedData.kategorization}});
                })
            }
        }
        ], {cancelable: false});
        return;
    }
    const tolulomo = rUpload.map(el => el.uri);
    
    await this.setState({rUpload: tolulomo, storeData:true, newPost: true, stype: carriedData.stype, nInterest:carriedData.nInterest, kategorization:carriedData.kategorization});
    return this.vType(1);
  }

  shareHeaderPress = async () => {
    const { title, shortdesc } = this.state.optionValue;
    let message = `Hello! \n Check out my post on LGB App \n ${title} \n ${shortdesc||null}` 
    try {
    Share.share({ message: message, title : title })
    } catch(err){
        console.log(err);
    }
  };

  getProfile = async() => {
    let goPage;
    goPage = await this.props.goPager;
    goPage = goPage === 0 ? 1 : goPage;
    // console.log(goPage);
    this.setState({loading:true, error: false, errs:null, errNum:null, isRefreshing:true, loadingInfo: 'getting your post...', storeData:false});
    try {
        await this.props.postActions.fetchcatags();
        if(this.props.userPost.length <= 0){
            await this.props.profileActions.fetchUser();
            await this.props.postActions.fetchPosts(goPage);
        }
        return this.setState({loading: false, isRefreshing:false, storeData:true, loadingInfo:null,});
    }catch(err) {
        return this.setState({loading: false, error: true, errs: err.message, errNum:1,loadingInfo:null});
    }

  }

  loadMorePost = async() => {
    if (this._isMounted) {
        let goPage;
        goPage = await this.props.goPager;
        goPage = goPage === 0 ? 1 : goPage;
        if(this.state.moreloader) {
            console.log('tina');
            console.log(goPage);
            setTimeout(async()=>{
                this.setState({moreloader:true, loadingInfo: 'loading post...', error:false});
                try {
                    await this.props.postActions.fetchPosts(goPage);
                    return this.setState({moreloader: false, storeData:true, loadingInfo:null}); 
                }catch(err) {
                    return this.setState({moreloader: false, error: true, errs: err.message, errNum:1, loadingInfo:null});
                }
            }, 1000)
            return;
        } 
        else {
            // console.log('tona');
            // console.log(goPage);
            this.setState({moreloader:true, loadingInfo: 'loading post...'});
            try {
                return setTimeout(async()=>{
                    await this.props.postActions.fetchPosts(goPage)
                    return this.setState({moreloader: false, storeData:true, loadingInfo:null,});
                }, 1000);
            }catch(err) {
                return this.setState({moreloader: false, error: true, errs: err.message, errNum:1, loadingInfo:null});
            }
        }
    }
    return;
  }

  renderPostItems =({item}) => (
    <ColumnGrid imgUrl={item.imageUrl} 
    titleLabel={item.title} userImg={Odb.dbUrl + item.creator.img[0]} 
    userName = {item.creator.displayName} stype={item.stype}
    type='owner' headerPress={() => this.headerPress(item)} 
    onSelects={() => this.productSelect(item)}/>
  );

  getNewLocationData = async(e) => {
    const newLocation = e.nativeEvent.coordinate;
    newLocation.longitudeDelta = 0.045;
    newLocation.latitudeDelta =  0.02;
    await this.setState({region: newLocation});
  }

  productSelect = async(item) => {
    const post = []
    const { routeName } = this.props.navigation.state;
    const { name, _id } = item.category;
    if(item && item.stype === 'Found') {
        if(_id) {
            post.push(item.category);
            await this.props.dash.storedSearches(post);
            return this.props.navigation.navigate("Categories",{headName: name, idToFind:_id, routeKey:routeName, item:item});
        }
        return;
    }
    return this.props.navigation.navigate('Product', {item: {...item}});
  }

  tryAgainButton = (data) => {
    console.log(this.state.errNum);
    if(this.state.errNum === null) {
        return;
    }
    if(this.state.errNum === 1) {
        this.setState({storeData:false});
        return this.loadMorePost();
    }
    if(this.state.errNum === 2) {
        return this.finalSubmit();
    }
    if(this.state.errNum === 3) {
        return this.deleteUserPost();
    }
  }
  //Screen Options

  //Post Form ===>>> 1
    npostType =()=> {
        let showCat = []
        this.props.categoryList ? this.props.categoryList.map(el => showCat.push({label: el.name, value: el._id, key:el._id })): null
        let showCList = [{label: 'Personal', value: 'Found', key:'01' }, {label: 'Business', value: 'Posted', key:'02' }]
        let showCatList = [{label: 'Sales', value:'sales'}, {label: 'Services', value:'services'}];
        
        return (
            <Block flex={1} style={{paddingHorizontal: 8}}>
                <Block style={{marginTop: height <=680 ? 0:25, borderBottomWidth:1, borderColor:'rgb(114,114,114)', flex:0.18}}>
                    <RNPickerSelect
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{fontSize: 21, }}
                        style={{...styles.inputSelect, borderColor:argonTheme.COLORS.GRADIENT_START,
                        inputAndroid: {color:argonTheme.COLORS.PRIMARY},
                        placeholder: {fontSize: 21, color:argonTheme.COLORS.PRIMARY} }}
                        onValueChange={val => this.setState({stype:val})}
                        items={showCList}
                        placeholder= {{label: 'Post', value: null}}
                        Icon={() => {
                            return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                            size={21} style={{color:argonTheme.COLORS.PRIMARY}}  />;
                        }}
                    />
                    <Badges tip='0' tops />
                </Block>
                <Block style={{marginTop: height <=680 ? 25:55, borderBottomWidth:1, borderColor:'rgb(114,114,114)', flex:0.18}}>
                    <RNPickerSelect
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{fontSize: 21,}}
                        style={{...styles.inputSelect, borderColor:argonTheme.COLORS.GRADIENT_START,
                        inputAndroid: {color:argonTheme.COLORS.PRIMARY},
                        placeholder: {fontSize: 21, color:argonTheme.COLORS.PRIMARY} }}
                        onValueChange={val => this.setState({nInterest:val})}
                        items={showCat}
                        placeholder= {{label: 'Post Type', value: null}}
                        Icon={() => {
                            return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                            size={21} style={{color:argonTheme.COLORS.PRIMARY}}  />;
                        }}
                    />
                    <Badges tip='1' tops/>
                </Block>
                <Block style={{flex:0.5, marginTop:30}}>
                    <Block row >
                        <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.PRIMARY, flex: 1.3}}>Categorization:</Text>
                        <Block row justifyContent='space-around' style={{marginLeft:5, flex:1.7 }}>
                            <RadioButton column={true} options={showCatList} onChange={value => this.setState({kategorization:value})}/>
                        </Block>
                    </Block>
                    <Badges tip='2' bColor/>
                </Block>
                <Block flex row style={{marginTop: 22, flex:0.15, justifyContent:'space-around', alignItems:'center', width:width-theme.SIZES.BASE*1.4}}>
                    <Button shadowless={true} onPress={() => this.vType(1)}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,fontSize: 18,...styles.textFont}}>Next</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }

    //Post Form ===>>> 2
    photoUpload = () => {
        return(
            <Block middle flex={1}>
                {
                    this.state.rUpload && this.state.rUpload.length > 0 ?
                    <Block flex={1}>
                       <ScrollView
                            onScroll={() => this.setState({onImgScroll:true})}
                            horizontal={true}
                            style={{backgroundColor: argonTheme.COLORS.GRADIENT_START}}
                            pagingEnabled={true}
                            decelerationRate={0}
                            scrollEventThrottle={16}
                            snapToAlignment="left"
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width - theme.SIZES.BASE}>
                            {
                            this.state.rUpload.map((el, index) =>(<Block key={el} style={{ flex: 1, width:width, height:height,}}>
                            <Image
                                resizeMode='cover'
                                source={{ uri: el }}
                                style={{ width: width - theme.SIZES.BASE, height:'auto', flex:1 }}
                            />
                            </Block>))
                            }
                        </ScrollView>
                    </Block>
                    :
                    <Block middle center >
                        <TouchableOpacity onPress={this.goFindPhoto}>
                            <Block middle style={{...styles.social, ...styles.shadow }}>
                                <EvilIcons name="camera" size={theme.SIZES.BASE * 4.625} color={argonTheme.COLORS.GRADIENT_START} />
                            </Block>
                        </TouchableOpacity>
                    </Block>
                }
                {
                    this.state.rUpload && this.state.rUpload.length > 1 && this.state.onImgScroll === false ?
                    <Block row style={{position: 'absolute', right: 0, justifyContent:'center', backgroundColor:'#FFF', padding: 8}}>
                        <Text style={{marginRight: 5, color:argonTheme.COLORS.GRADIENT_END, fontFamily:'regular', fontSize:18 }}>{`${this.state.rUpload.length||null} Selections`}</Text>
                    </Block> : null
                }
                <Block row style={{position: 'absolute', bottom: -15, alignItems:'center'}}>
                    {
                        this.state.rUpload && this.state.rUpload.length > 0 ?
                        <Button shadowless={true} onPress={() => this.vType(2)}
                            style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY }}>
                            <Block>
                                <Text style={{ color: argonTheme.COLORS.WHITE,
                                fontSize: 18,...styles.textFont}} >Next</Text>
                            </Block>
                        </Button>:null
                    }
                </Block>
            </Block>
        );
    }

    //Post Form ===>>> 3
    postTitle = () =>{
        return(
            <Block style={{flex:1, justifyContent:'space-around'}} >
                <Block>
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={18}
                        lborder={true}
                        label = 'Post Title'
                        value={this.state.ntitle !== null ? this.state.ntitle : ''}
                        onChangeText={text => { this.setState({ntitle:text}) }}
                        autoCompleteType = "name"
                        autoCapitalize = "sentences"
                        returnKeyType="next"
                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                    <Badges tip='3' tops/>
                </Block>
                <KeyboardAvoidingView enabled={true}
                    style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : null}>
                    <SafeAreaView style={{flex:1, justifyContent:'space-around'}}>
                        <Block>
                            <FInput
                                ww
                                lcolor={argonTheme.COLORS.GRADIENT_START}
                                lfont={18}
                                label = 'Enter short description here...'
                                lborder={true}
                                value={this.state.nshort !== null ? this.state.nshort : ''}
                                onChangeText={text =>  this.setState({nshort:text})}
                                autoCapitalize = "sentences"
                                multiline={true}
                                numberOfLines = {4}
                                onSubmitEditing={() => {
                                    if (!this.state.nshort.endsWith("\n")) {
                                    let postText = this.state.nshort;
                                    postText = postText + "\n";
                                    this.setState({nshort:postText})
                                    }
                                }}
                                returnKeyType= {Platform.OS==='ios'?'next':'none'}
                                style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START, height: 90}}
                            />
                            <Badges tip='4' tops/>
                        </Block>
                    </SafeAreaView>
                </KeyboardAvoidingView>
                <Block center row style={{position: 'absolute', bottom: -15, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => {
                        this.state.stype === 'Found' ? this.getlocal(): this.vType(3)
                    }}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Next</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }

    //Post Form ===>>> 4
    pricing = () => {
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block style={{flex:0.9, justifyContent:'space-around', marginBottom:25}}>
                <Block>
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={18}
                        lborder={true}
                        label = 'Unit Price (e.g. 20.00)'
                        value={this.state.nprice > 0 ? this.state.nprice.replace(/[^0-9.]/g,''): ''}
                        onChangeText={text =>  this.setState({nprice:text.replace(/[^0-9.]/g,'')})}
                        autoCompleteType = "off"
                        autoCorrect={false}
                        returnKeyType="next"
                        keyboardType = { Platform.OS === 'android' ? "number-pad" : "numbers-and-punctuation" }
                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                </Block>
                <Block>
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={18}
                        lborder={true}
                        label = 'Discount Price (If Available - e.g. 10%)'
                        value={this.state.nDiscount > 0 ? this.state.nDiscount.replace(/[^0-9,.]/g,''): ''}
                        onChangeText={text =>  this.setState({nDiscount:text.replace(/[^0-9.]/g,'')}) }
                        autoCompleteType = "off"
                        autoCorrect={false}
                        keyboardType = { Platform.OS === 'android' ? "number-pad" : "numbers-and-punctuation" }
                        returnKeyType="next"
                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                </Block>
                <Block>
                    <KeyboardAvoidingView enabled={true} behavior={Platform.OS === "ios" ? "padding" : null} >
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={18}
                        lborder={true}
                        label = 'Url Link (e.g. google.com/me)'
                        value={this.state.nlink !== null ? this.state.nlink: ''}
                        onChangeText={text =>  this.setState({nlink:text.toLowerCase()}) }
                        autoCompleteType = "off"
                        autoCorrect={false}
                        returnKeyType="next"
                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                    </KeyboardAvoidingView>
                </Block>
                </Block>
                <Block style={{flex:0.1, justifyContent:'space-around', zIndex:0,}}></Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => this.vType(4)}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Next</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }

    //Post Form ===>>> 5
    generalDescrpt = () => {
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block>
                    <KeyboardAvoidingView enabled={true} behavior={Platform.OS === "ios" ? "padding" : null} >
                    <FInput
                        iAnimate ={{outputRange: 125, paddingTop: 95}}
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={18}
                        label = 'Enter Long description here...'
                        lborder={true}
                        value={this.state.nDesc !== null ? this.state.nDesc : ''}
                        onChangeText={text =>  this.setState({nDesc:text})}
                        autoCapitalize = "sentences"
                        multiline={true}
                        numberOfLines = {4}
                        returnKeyType= {Platform.OS==='ios'?'default':'none'}
                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START, height:'70%'}}
                    />
                    </KeyboardAvoidingView>
                </Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => this.vType(5)}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Next</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }

    //Post Form ===>>> 6
    nbtnCatList = () => {
        let btnCatList = [{label: 'Buy Now', value:'Buy Now'}, {label: 'Pay Now', value:'Pay Now'}, {label: 'Call Now', value:'Call Now'}, {label: 'Register Now', value:'Register Now'}, {label: 'Book Appointment', value:'Book Appointment'}, {label: 'Pre-Order', value:'Pre-Order'}, {label: 'Reserve Spot', value:'Reserve Spot'}];
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block style={{flex:1, paddingHorizontal: 10}}>
                    <Block flex={1} style={{ alignItems:'flex-start'}}>
                        <Block style={{flex: 0.1, marginTop:-8, zIndex:11, marginBottom:10,}}>
                            <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.PRIMARY}}>Select Preferred Button Type:</Text>
                        </Block>
                        <Block flex={0.9} style={{ paddingHorizontal: 10 }}>
                            <RadioButton options={btnCatList} onChange={value => this.setState({nButton:value})}/>
                        </Block>
                    </Block>
                </Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => this.vType(7)}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Next</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }

//Post Form ===>>> 7
  tagListings = () => {
    const stringLength = data => {
        const rData = data.split('|')[1].trim().length <= 14 ? data.split('|')[1].trim() : `${data.split('|')[1].trim().substring(0,14)}...`;
        return rData;
    }
    const showTagList=[];
    this.props.tagList ? this.props.tagList.map(el => showTagList.push({label: el.name, value: `${el._id}|${el.name}`, key:el._id })): {}
    return(
        <Block style={{flex:1, justifyContent:'space-around'}}>
            <Block style={{marginTop:5, borderBottomWidth:1, borderColor:'rgb(114,114,114)', flex:0.1, marginBottom:15}}>
                <RNPickerSelect
                    useNativeAndroidPickerStyle={false}
                    textInputProps={{fontSize: 21,}}
                    style={{...styles.inputSelect, borderColor:argonTheme.COLORS.GRADIENT_START,
                    inputAndroid: {color:argonTheme.COLORS.PRIMARY},
                    placeholder: {fontSize: 21, color:argonTheme.COLORS.PRIMARY} }}
                    onValueChange={value => this.pushTagSelect(value)}
                    items={showTagList}
                    placeholder= {{label: 'Tags (Multiple selection allowed)', value: null}}
                    Icon={() => {
                        return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                        size={21} style={{color:argonTheme.COLORS.PRIMARY}}  />;
                    }}
                />
            </Block>
            <Block style={{flex:0.8, borderWidth:StyleSheet.hairlineWidth, flexDirection: 'row',
                flexWrap: "wrap", borderColor:argonTheme.COLORS.GRADIENT_START}} >
                    {
                        this.state.nTag.map((el, index) => (
                            <Block style={{margin: 5, marginRight:14, width:theme.SIZES.BASE*9, borderWidth: StyleSheet.hairlineWidth, height: 30,
                            borderColor:argonTheme.COLORS.INFO, paddingLeft:3, }} key={index}>
                                <Block flex={1} row style={{justifyContent:'center'}}>
                                    <Block flex={0.8} style={{justifyContent:'center', overflow:'hidden'}}>
                                        <Text style={{fontFamily:'regular', color: argonTheme.COLORS.PRIMARY}}>{stringLength(el)}</Text>
                                    </Block>
                                    <Block flex={0.2} style={{justifyContent:'center', backgroundColor:'red'}} >
                                        <TouchableCmp shadowless  onPress={() => this.removeTagSelect(el)}>
                                            <Block style={{alignItems:'flex-end', backgroundColor:'red'}}>
                                                <Ionicons
                                                    style={{marginRight: 10}}
                                                    name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                                                    size={18}
                                                    color= {argonTheme.COLORS.GRADIENT_START}
                                                />
                                            </Block>
                                        </TouchableCmp> 
                                    </Block>
                                </Block>
                            </Block>
                        ))
                    }
            </Block>
            <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                <Button shadowless={true} onPress={() => this.vType(6)}
                    style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                    <Block>
                        <Text style={{ color: argonTheme.COLORS.WHITE,
                        fontSize: 18,...styles.textFont}} >Next</Text>
                    </Block>
                </Button>
            </Block>
        </Block>
    );
}


//Post Form ===>>> 8
    actionList = () => {
        let status;
        const btnCatList = [{label: 'Check Out', value:'checkout'}, {label: 'Register & Check Out', value:'register'}, {label: 'Register', value:'profile'}];
        if(this.state.nAction && this.state.nAction === 'checkout') {
            status = 'Suitable for sales';
        }
        else if(this.state.nAction && this.state.nAction === 'register') {
            status = 'Suitable for service delivery';
        }
        else if(this.state.nAction && this.state.nAction === 'profile') {
            status = 'Suitable for bookings and reservation with no fees';
        }
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block style={{flex:1, paddingHorizontal: 10}}>
                    <Block flex={height <= 712 ? 0.68 : 0.6} style={{ alignItems:'flex-start'}}>
                        <Block style={{flex: 0.1, marginTop:-8, zIndex:11, marginBottom:10,}}>
                            <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.PRIMARY}}>Select Preferred Action Type:</Text>
                        </Block>
                        <Block flex={0.9} style={{ paddingHorizontal: 10, }}>
                            <RadioButton column={true} options={btnCatList} onChange={value => this.setState({nAction:value})}/>
                        </Block>
                    </Block>
                    <Block style={{flex: height <= 712 ? 0.32 : 0.4, borderWidth:StyleSheet.hairlineWidth, 
                        borderColor:argonTheme.COLORS.GRADIENT_START, alignItems:'center'}} >
                            <Text fontSize={12} color={argonTheme.COLORS.PRIMARY} style={{fontFamily:'regular', marginTop: 10}}>{status}</Text>
                    </Block>
                </Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => this.getlocal()}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Next</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }

    //Post Form ===>>> 9
    locationSelect = () => {
        const { img } = this.props.rProfile;
        return(
            <Block style={{flex:1}}>
                {
                    this.state.newRegion === null ? 
                    <Block center style={{ position:'absolute', bottom: 180, zIndex:10 }}>
                        <Spinner color={argonTheme.COLORS.GRADIENT_START} label={this.state.loadingInfo}/>
                    </Block>
                    :
                    <Block style={{flex:1}}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            scrollEnabled={true}
                            style={{ flex: 1 }}
                            cacheEnabled={Platform.OS === 'android' ? true : false}
                            initialRegion={this.state.region}>
                            <Marker draggable
                                coordinate={this.state.region}
                                onDragEnd={(e) => this.getNewLocationData(e)}>
                                    <Image
                                        source={{ uri: Odb.dbUrl+img }}
                                        style={{width:40, height:40, borderRadius:20}}
                                    />
                            </Marker>
                        </MapView>
                    </Block>
                }
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => this.finalSubmit()}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY, alignItems:'center' }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Submit</Text>
                        </Block>
                    </Button>
                </Block>
            </Block>
        );
    }


  render() {
    const { img, lname, fname, dob, city, desc } = this.props.rProfile;
    const totalUserPosts = !this.props.totalUserPost? '0': this.props.totalUserPost;
    const listStep = `Step ${this.state.dType+1} of 9`;
    if(this.state.error === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height, width}}>
          <Text size={20} style={{...styles.textFont, marginBottom:5}}>{this.state.errs}</Text>
          <Button shadowless onPress={this.tryAgainButton} style={styles.errBtn}>
            <Block row space="between">
                <Text style={styles.textFont} size={14} color={ Platform .OS==='android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
            </Block>
          </Button>
        </Block>
      )
    }
    return (
      <Block flex style={styles.profile}>
        {
          this.state.loading===true ? <Block center style={{ position:'absolute', bottom: 180, zIndex:10 }}><Spinner color={argonTheme.COLORS.GRADIENT_START} label={this.state.loadingInfo}/></Block>:null
        }
        <Block flex style={{flex:1, backgroundColor:argonTheme.COLORS.GRADIENT_END}}>
            <ImageBackground source={Images.ProfileBackground} style={styles.profileContainer} imageStyle={styles.profileBackground}>
                <Block flex style={{...styles.profileCard, marginTop:!this.state.scrollingT ? 145:80}}>
                    {
                        this.state.scrollingT ? null:
                        <Block middle style={styles.avatarContainer}>
                            <Image
                                source={{ uri: Odb.dbUrl+img }}
                                style={styles.avatar}
                            />
                        </Block>
                    }
                    {
                        this.state.scrollingT ? null:
                        <Block style={styles.info}>
                            <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                                <Button onPress={this.createNewPost} shadowless={true}
                                style={{width:width/2, backgroundColor: Platform.OS==='android'?argonTheme.COLORS.GRADIENT_END:'transparent' }}>
                                    <Block row>
                                        <Ionicons
                                        style={{marginRight: 10}}
                                        name={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
                                        size={16}
                                        color= {Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_END}
                                        />
                                        <Text style={{ color: Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_END,
                                        fontSize: 16,...styles.textFont}} >New Posting</Text>
                                    </Block>
                                </Button>
                            </Block>
                            <Block row space="between">
                                <TouchableOpacity>
                                    <Block middle>
                                        <Text size={12} color="#525F7F" style={{...styles.textFont, marginBottom: 4 }}>2K</Text>
                                        <Text style={{fontFamily:'bold'}} size={12} color={argonTheme.COLORS.GRADIENT_END}>Orders</Text>
                                    </Block>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Block middle>
                                        <Text color="#525F7F" size={12} style={{ marginBottom: 4 }}>10</Text>
                                        <Text style={{fontFamily:'bold'}} size={12} color={argonTheme.COLORS.GRADIENT_END}>Pending</Text>
                                    </Block>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Block middle>
                                        <Text color="#525F7F" size={12} style={{ ...styles.textFont, marginBottom: 4 }}>{this.manageNumbers(totalUserPosts)}</Text>
                                        <Text style={{fontFamily:'bold'}} size={12} color={argonTheme.COLORS.GRADIENT_END}>Postings</Text>
                                    </Block>
                                </TouchableOpacity>  
                            </Block>
                        </Block>
                    }
                    <Block style={{flex:1}}>
                        <Block middle style={{ marginTop: 5, marginBottom: 3 }}>
                            <Block style={styles.divider} />
                        </Block>
                        <Block row style={{ paddingVertical: 14, alignItems: "baseline" }} >
                            <Text style={{fontFamily:'bold'}} size={16} color={argonTheme.COLORS.GRADIENT_END}>
                                {`My Postings (${this.manageNumbers(totalUserPosts)})`}
                            </Text>
                        </Block>
                        <Block row style={{ paddingBottom: 20, justifyContent: "flex-end" }}>
                            <TouchableOpacity shadowless style={styles.filterViewBtn} onPress={this.viewType}>
                                {
                                    this.state.viewsType ? 
                                <Block row space="between" style={{ marginTop: 20, paddingBottom: 5}} >
                                    <Ionicons size={14} name={Platform.OS === 'android' ? 'md-grid' : 'ios-grid'}
                                    color={argonTheme.COLORS.GRADIENT_END} bold
                                    style={{paddingTop: Platform.OS === 'android' ? height <=720 ? 3 : 4 : height <=720 ? 3.2 : 3}}/>
                                    <Text style={{fontFamily:'bold'}} size={16} color={argonTheme.COLORS.GRADIENT_END}>Grid View</Text>
                                </Block> :
                                <Block row space="between" style={{ marginTop: 20, paddingBottom: 5}} >
                                    <Ionicons size={14} name={Platform.OS === 'android' ? 'md-list' : 'ios-list'}
                                    color={argonTheme.COLORS.GRADIENT_END} 
                                    style={{paddingTop: Platform.OS === 'android' ? height <=720 ? 3 : 3.9 : height <=720 ? 3.2 : 3}}/>
                                    <Text style={{fontFamily:'bold'}} size={16} color={argonTheme.COLORS.GRADIENT_END}>List View</Text>
                                </Block>
                                }
                            </TouchableOpacity>
                        </Block>
                       
                        {
                            this.state.viewsType ? 
                            <Block style={{ paddingBottom: -HeaderHeight * 2, width:(width-(theme.SIZES.BASE*2)), marginLeft: -16, flex:1, height:'auto'}}>
                                <FlatList
                                    style={{flex: 1}}
                                    bounces={false}
                                    showsVerticalScrollIndicator={false}
                                    extraData={this.props.userPost}
                                    data={this.props.userPost}
                                    initialNumToRender={3}
                                    keyExtractor={pp => pp._id}
                                    onEndReachedThreshold={0.5}
                                    onEndReached={this.loadMorePost}
                                    // refreshing={this.state.loading || this.state.loadingInfo}
                                    removeClippedSubviews
                                    onScroll={() => !this.state.scrollingT ? this.setState({scrollingT:true}):null}
                                    renderItem={this.renderPostItems}
                                /> 
                            </Block>
                            : 
                            <Block style={{ paddingBottom: -HeaderHeight * 2, flex:1}}>
                                <ScrollView style={{flex:1}}>
                                    <Block row space="between" style={{ flexWrap: "wrap", flex:1 }}>
                                        {this.props.userPost.map((img, imgIndex) => (
                                        <Thumbnails imgUrl={Odb.dbUrl + img.imageUrl[0]} key={img._id} 
                                            onSelects={() => this.productSelect(img)}/>
                                        ))}
                                    </Block>
                                </ScrollView>
                          </Block>
                        }
                        
                    </Block>
                    <Block style={{position:'absolute', right: 1, top: 4, width:'auto', height:'auto'}}>
                        <TouchableCmp shadowless onPress={() => this.setState({scrollingT:!this.state.scrollingT})} style={{flex:1}}>
                            <Icon
                                name='settings-backup-restore'
                                family='MaterialIcons'
                                size={28}
                                color= {argonTheme.COLORS.GRADIENT_END}
                            />
                        </TouchableCmp>
                    </Block>
                </Block>
                <Block style={{backgroundColor:'blue',marginBottom: Platform.OS === 'android' ? 
                height < 700 ? '17%' : '17%' : height < 700 ? '16%' : '16%'}}></Block>
                {
                    this.state.moreloader===true ? <Block center style={{ position:'absolute', bottom:height<=720?60:80, zIndex:100 }}><Spinner color={argonTheme.COLORS.GRADIENT_START} textColor label={this.state.loadingInfo}/></Block>:null
                }
            </ImageBackground>
        </Block>
        {
            this.state.options ?
            <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
                <Block style={{...styles.floatInside, height: Platform.OS==='android'?240:250, paddingHorizontal: 0, marginBottom: 15}}>
                    <Block flex>
                        <TouchableCmp shadowless style={styles.optionBtn} onPress={this.deleteUserPost}>
                            <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                            borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                            <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}>Delete</Text>
                            </Block>
                        </TouchableCmp>
                        <TouchableCmp shadowless style={{...styles.optionBtn, flex:0.215}} onPress={this.shareHeaderPress}>
                            <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                            borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%', flex:1 }}>
                            <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Share...</Text>
                            </Block>
                        </TouchableCmp>
                        <TouchableCmp shadowless style={{...styles.optionBtn, flex:0.215}}>
                            <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                            borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%', flex:1 }}>
                            <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Edit Post</Text>
                            </Block>
                        </TouchableCmp>
                        <TouchableCmp shadowless style={{...styles.optionBtn, flex:0.22}}>
                            <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                            borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%', flex:1 }}>
                            <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>{`Manage Schedule & Inventory`}</Text>
                            </Block>
                        </TouchableCmp>
                        <TouchableCmp shadowless style={{...styles.optionBtn}} onPress={this.promoteThisPost}>
                            <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 10 }}>
                            <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Promote Post</Text>
                            </Block>
                        </TouchableCmp>
                    </Block>
                </Block>
                <Block flex={0.075} style={{...styles.floatInside, marginBottom: Platform.OS==='android' ? 100 : 95}}>
                    <TouchableCmp shadowless style={{...styles.optionBtn, marginTop: 0, height: 70, flex: 1}} onPress={this.headerPressCancel}>
                        <Block flex={1} style={{justifyContent:'center', alignItems:'center', height: 70 }}>
                            <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON, marginTop: -4}}>Cancel</Text>
                        </Block>
                    </TouchableCmp>
                </Block>
            </Block>
            :
            null
        }
        {this.state.newPost ?
            <Block shadow={true} shadowColor='black' center style={{...styles.float}} justifyContent='center' alignItems='center'>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} flex={1}>
                    <Block style={{...styles.floatInside, paddingVertical:0, alignItems: 'center', height: height * 0.56, backgroundColor:'rgba(151,101,195,0.4)', overflow:'hidden'}}>
                        <Block row flex={0.25} style={{width:width-theme.SIZES.BASE,backgroundColor:'white'}}>
                            <Block flex={0.2} style={{justifyContent:'center', alignItems:'center'}}>
                                {this.state.dType=== 0 ? null :
                                <TouchableCmp shadowless onPress={this.backToPrevious}>
                                    <Ionicons
                                        style={{marginRight: 10}}
                                        name={Platform.OS === 'android' ? 'md-arrow-back' : 'ios-arrow-back'}
                                        size={28}
                                        color= {argonTheme.COLORS.GRADIENT_START}
                                    />
                                </TouchableCmp>
                                }
                            </Block>
                            <Block flex={1.6} style={{justifyContent:'center', alignItems:'center'}}>
                                <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{helpers[this.state.dType]}</Text>
                            </Block>
                            <Block flex={0.2} style={{justifyContent:'center', alignItems:'center'}}>
                                <TouchableCmp shadowless onPress={this.closeNewPost}>
                                    <Ionicons
                                        style={{marginRight: 10}}
                                        name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                                        size={28}
                                        color= {argonTheme.COLORS.GRADIENT_START}
                                    />
                                </TouchableCmp>
                            </Block>
                        </Block>
                        <Block flex={1.5} style={{width:width-theme.SIZES.BASE, marginTop: 5, backgroundColor:'rgba(244,239,249,0.8)', paddingVertical:20, paddingHorizontal:8}}>
                            {this.screen()}
                        </Block>
                        <Block flex={0.2} style={{width:width-theme.SIZES.BASE,backgroundColor:'white', marginTop:5, justifyContent:'center', alignItems:'center'}}>
                            <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{listStep}</Text>
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
            </Block>
            :
            null
        }

        {this.state.submitted ?
            <Block shadow={true} shadowColor='black' center style={{...styles.float}} justifyContent='center' alignItems='center'>
                <Block style={{...styles.floatInside, paddingVertical:0, alignItems: 'center', height: height * 0.56, backgroundColor:'rgba(151,101,195,0.4)', overflow:'hidden'}}>
                    <Block row flex={0.25} style={{width:width-theme.SIZES.BASE,backgroundColor:'white'}}>
                        <Block flex={1.8} style={{justifyContent:'center', alignItems:'center'}}>
                            <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{this.state.deleted ? 'Deleted' : 'Success!!!'}</Text>
                        </Block>
                        <Block flex={0.2} style={{justifyContent:'center', alignItems:'center'}}>
                            <TouchableCmp shadowless onPress={() => this.setState({submitted:false, deleted: false, options:false})}>
                                <Ionicons
                                    style={{marginRight: 10}}
                                    name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                                    size={28}
                                    color= {argonTheme.COLORS.GRADIENT_START}
                                />
                            </TouchableCmp>
                        </Block>
                    </Block>
                    <Block flex={1.5} style={{width:width-theme.SIZES.BASE, marginTop: 5, backgroundColor:'rgba(244,239,249,0.8)', paddingVertical:20, paddingHorizontal:8}}>
                        {
                            this.state.deleted ?
                                <Block flex={1} center middle style={{justifyContent:'center', alignContent:'center'}}>
                                    <Ionicons
                                        style={{marginRight: 10}}
                                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                                        size={56}
                                        color= {argonTheme.COLORS.WARNING}
                                    />
                                    <Text fontSize={28} color={argonTheme.COLORS.WARNING} style={{fontFamily:'bold'}}>Post deleted successfully!</Text>
                                </Block> :
                                    <Block flex={1} center middle style={{justifyContent:'center', alignContent:'center'}}>
                                    <Ionicons
                                        style={{marginRight: 10}}
                                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                                        size={56}
                                        color= {argonTheme.COLORS.SUCCESS}
                                    />
                                    <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Post submitted successfully!</Text>
                                </Block>
                        }
                    </Block>
                    <Block flex={0.2} style={{width:width-theme.SIZES.BASE,backgroundColor:'white', marginTop:5, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{null}</Text>
                    </Block>
                </Block>
            </Block>
            :
            null
        }
      </Block>
    );
  }
}

const styles = StyleSheet.create({
    float: {
        flex: 1, 
        elevation: 5,
        position:'absolute',
        height:height,
        zIndex:2,
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: width
      },
      floatInside: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius:4, 
        width:width-theme.SIZES.BASE, 
        height: 150, zIndex:5, 
        marginBottom: 25, 
        backgroundColor:'#FFF', 
        elevation: 5,
        zIndex:5,
        opacity: 1,
        borderColor: argonTheme.COLORS.GRADIENT_START,
        borderWidth: StyleSheet.hairlineWidth,
      },
      optionBtn: {
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
        flex:0.2
      },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    errBtn:{
        width: theme.SIZES.BASE * 8,
        backgroundColor: Platform.OS === "android" ? argonTheme.COLORS.GRADIENT_START : 'transparent'
    },
    profile: {
        marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
        // marginBottom: -HeaderHeight * 2,
        flex: 1,
        zIndex:0
    },
    profileContainer: {
        width: width,
        height: height,
        padding: 0,
        zIndex: 1,
    },
    filterViewBtn: {
        width: '25%'
    },
    profileBackground: {
        width: width,
        height: height / 2
    },
    profileCard: {
        height:height,
        padding: theme.SIZES.BASE,
        marginHorizontal: theme.SIZES.BASE,
        marginTop: 145,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        backgroundColor: theme.COLORS.WHITE,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        shadowOpacity: 0.2,
        elevation: 5,
        zIndex: 2,
        backgroundColor:'#f2f2f2',
    },
    info: {
        paddingHorizontal: 40
    },
    avatarContainer: {
        position: "relative",
        marginTop: -80
    },
    avatar: {
        width: 124,
        height: 124,
        borderRadius: 62,
        borderWidth: 0
    },
    nameInfo: {
        marginTop: 35
    },
    divider: {
        width: "100%",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "transparent"
    },
    thumb: {
        borderRadius: 4,
        marginVertical: 4,
        alignSelf: "center",
        width: thumbMeasure,
        height: thumbMeasure
    },
    textFont: {
        fontFamily: 'regular'
    },
    inputSelect: {
        fontFamily: 'regular', 
        fontSize: 25, 
        color: 'black', 
        width: '100%'
    },
    importantStyle: {
        position: 'absolute',
        bottom: -15,
        right: 0,
        width: 70,
        height: 17,
        justifyContent:'flex-end',
        alignContent:'flex-end'
    },
});

const mapStateToProps = function(state) {
  return {
    rProfile: state.profile.profile,
    userPost: state.posting.availablePosts,
    totalUserPost: state.posting.totalPost,
    categoryList : state.posting.category,
    tagList : state.posting.tags,
    goPager: state.posting.userPostPager,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    postActions: bindActionCreators(postActions, dispatch),
    profileActions: bindActionCreators(profileActions, dispatch),
    dash: bindActionCreators(dash, dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Post);