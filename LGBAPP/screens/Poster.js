import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Dimensions, Keyboard,
  ScrollView, Share, TouchableWithoutFeedback,
  Image, FlatList, SafeAreaView,
  ImageBackground, KeyboardAvoidingView,
  Platform, TouchableOpacity, TouchableNativeFeedback
} from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import * as postActions from '../store/actions/posting';
import { Block, Text, theme } from "galio-framework";
import { Button, Spinner, FInput, RadioButton } from "../components";
import { Images, argonTheme } from "../constants";
import { Ionicons, EvilIcons, MaterialIcons } from '@expo/vector-icons';
import { HeaderHeight } from "../constants/utils";
import Thumbnails from "../components/Thumbnail";
import ColumnGrid from "../components/ColumnGrid";
import { Odb } from "../actionable";
import { useSelector, useDispatch } from 'react-redux';


const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;


let TouchableCmp = TouchableOpacity;

if (Platform.OS === 'android' && Platform.Version >= 5) {
    TouchableCmp = TouchableNativeFeedback;
}
const helpers = ['What do you intend posting today?', 'Tell us your name', 'Do you have a business?', 'Tap to Select Date of Birth', 'Enter your Country & Zip', 
                'Enter your State & City','Enter your State & City','Enter your State & City','Enter your State & City' ];
const Postings = props => {
    const { navigation } = props
    const [isLoading, setIsLoading] = useState(false);
    const [dType, setDType] = useState(0);
    const [viewsType, setIsViewsType] = useState(false);
    const [pager, setIsPager] = useState(1)
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const [options, setOptions] = useState(false);
    const [optionValue, setOptionValue] = useState(null);
    const [newPost, setNewPost] = useState(false);
    const [onImgScroll, setOnImgScroll] = useState(false);

    //FormData
    const [ntitle, setNtitle] = useState(null);
    const [stype, setStype] = useState(null);
    const [nInterest, setNInterest] = useState(null);
    const [kategorization, setKategorization] = useState(null);
    const [nshort, setNshort] = useState(null);
    const [nDesc, setNDesc] = useState(null);
    const [nprice, setNprice] = useState(null);
    const [nDiscount, setNDiscount] = useState(null);
    const [nImage, setNImage] = useState(null);
    const [nlink, setNlink] = useState(null);
    const [nButton, setNButton] = useState(null);
    const [nAction, setNAction] = useState(null);
    const [nTag, setNTag] = useState([]);
    const [nStock, setNStock] = useState(null);
    const [nStockUnit, setNStockUnit] = useState(null);
    const [nlocation, setNlocation] = useState(null);

    //tag keeping
    const tagListingArr = [];

    //Redux
    const posts = useSelector(state => state.posting.availablePosts);
    const totalPosts = useSelector(state => state.posting.totalPost);
    const categoryList = useSelector(state => state.posting.category);
    const tagList = useSelector(state => state.posting.tags);
    const dispatch = useDispatch();

    //Photo Upload
    const rUpload = props.navigation.getParam('rUpload', null);
    if (rUpload !== null && rUpload.length > 4) {
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

    const viewType = useCallback(() => {
        viewsType === true ? setIsViewsType(false) : setIsViewsType(true)
    }, [viewsType]);

    const loadPosts = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
          await dispatch(postActions.fetchcatags());
          await dispatch(postActions.fetchPosts(pager));
        } catch (err) {
          setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);


    const createNewPost = () => {
        setNewPost(true);
        vType(0);
        return;
    };

    // Switcher
    const vType = useCallback((val) => {
        switch(val){
        case 0:
            return setDType(0);
        case 1:
            setDType(1);
            return
        case 2:
            setDType(2);
            return   
        case 3:
            setDType(3);
            return
        case 4:
            setDType(4);
            return
        case 5:
            setDType(5);
            return
        case 6:
            setDType(6);
            return
        case 7:
            setDType(7);
            return
        case 8:
            setDType(8);
            return
        default: 
        return;
        }
    });
    
    useEffect(() => {
    const willFocusSub = props.navigation.addListener(
        'willFocus',
        loadPosts
        );
        return () => {
            willFocusSub.remove();
        };
    }, [loadPosts]);
    
    useEffect(() => {
        setIsLoading(true);
        navigation.setParams({ navHeaderFunction: navHeaderFunctions })
        loadPosts().then(() => {
            setIsLoading(false);
        });
    }, [dispatch,loadPosts,navHeaderFunctions]);

    useEffect(() => {
        if(rUpload && rUpload.length >0) {
            setNImage(rUpload);
            setNewPost(true);
            vType(1)
        }
        return;
    }, [rUpload, setNewPost]);

    const headerPress = useCallback(data => {
        setOptions(true);
        setOptionValue(data)
        return;
    });

    const headerPressCancel = useCallback(() => {
        setOptions(false);
        setOptionValue(null)
        return;
    })

    const navHeaderFunctions = useCallback(() => {
        return createNewPost();
    })

    const pushTagSelect =useCallback(data=>{
        data !== null ? setNTag(oldArray => [...oldArray, data]) : null;
        return;
    },[setNTag])

    const removeTagSelect = useCallback(async data => {
        const index = nTag.findIndex(x => x === data);
        console.log(index);
        if (index >= 0) {
            const newArray = nTag;
            await newArray.splice(index, 1);
            return setNTag(newArray)
        }
        
        
        console.log(nTag.length);
    },[setNTag, nTag])


    const closeNewPost = useCallback(() => {
        setNewPost(false)
        return;
    })

    const categorization = useCallback((data) => {
        setKategorization(data)
    },[setKategorization])

    const shareHeaderPress = useCallback(async () => {
        const { title, shortdesc} = optionValue;
        let message = `Hello! \n Check out my post on LGB App \n ${title} \n ${shortdesc||null}` 
        try {
        Share.share({ message: message, title : title })
        } catch(err){
            setError(err);
        }
    },[Share, optionValue]);

    if (error) {
        return (
            <Block flex style={styles.profile}>
                <Block flex>
                    <ImageBackground
                        source={Images.ProfileBackground}
                        style={styles.profileContainer}
                        imageStyle={styles.profileBackground}
                    >
                        <Block style={styles.centered}>
                            <Text size={20} style={{...styles.textFont, marginBottom:5}}>An error occurred!</Text>
                            <Button shadowless onPress={loadPosts} style={styles.errBtn}>
                            <Block row space="between">
                                <Text size={16} color={ Platform.OS === 'android' ? 'white' : argonTheme.COLORS.GRADIENT_START}> Try Again!</Text>
                            </Block>
                            </Button>
                        </Block>
                    </ImageBackground>
                </Block>
            </Block>
        );
    }

    if (isLoading) {
        return (
            <Block style={styles.centered}>
                <Spinner label='...loading your posts' />
            </Block>
        );
    }
    
    if (!isLoading && posts.length === 0) {
        return (
            <Block style={styles.centered}>
                <Text style={styles.textFont}>No products found. Maybe start adding some!</Text>
            </Block>
        );
    }

    // console.log(stype);
    //Post Form ===>>> 1
    const npostType =()=> {
        let showCat = []
        categoryList ? categoryList.map(el => showCat.push({label: el.name, value: el._id, key:el._id })): null
        let showCList = [{label: 'Personal', value: 'Found', key:'01' }, {label: 'Business', value: 'Posted', key:'02' }]
        let showCatList = [{label: 'Sales', value:'sales'}, {label: 'Services', value:'services'}];
        
        return (
            <Block flex={1} style={{paddingHorizontal: 8}}>
                <Block style={{marginTop: height <=680 ? 0:25, borderBottomWidth:1, borderColor:'rgb(114,114,114)', flex:0.18}}>
                    <RNPickerSelect
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{fontSize: 21,}}
                        style={{...styles.inputSelect, 
                        placeholder: {fontSize: 21, color:argonTheme.COLORS.PRIMARY} }}
                        onValueChange={val => setStype(val)}
                        items={showCList}
                        placeholder= {{label: 'Post', value: null}}
                        Icon={() => {
                            return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                            size={21} style={{color:argonTheme.COLORS.PRIMARY}}  />;
                        }}
                    />
                </Block>
                <Block style={{marginTop: height <=680 ? 25:55, borderBottomWidth:1, borderColor:'rgb(114,114,114)', flex:0.18}}>
                    <RNPickerSelect
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{fontSize: 21,}}
                        style={{...styles.inputSelect,
                        placeholder: {fontSize: 21, color:argonTheme.COLORS.PRIMARY} }}
                        onValueChange={val => setStype(val)}
                        items={showCat}
                        placeholder= {{label: 'Post Type', value: null}}
                        Icon={() => {
                            return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                            size={21} style={{color:argonTheme.COLORS.PRIMARY}}  />;
                        }}
                    />
                </Block>
                <Block style={{flex:0.5, marginTop:30}}>
                    <Block row >
                        <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.PRIMARY, flex: 1.3}}>Categorization:</Text>
                        <Block row justifyContent='space-around' style={{marginLeft:5, flex:1.7 }}>
                            <RadioButton column={true} options={showCatList} onChange={value => categorization(value)}/>
                        </Block>
                    </Block>
                </Block>
                <Block flex row style={{marginTop: 22, flex:0.15, justifyContent:'space-around', alignItems:'center', width:width-theme.SIZES.BASE*1.4}}>
                    <Button shadowless={true} onPress={() => vType(1)}
                        style={{width:width/3, backgroundColor:argonTheme.COLORS.PRIMARY }}>
                        <Block>
                            <Text style={{ color: argonTheme.COLORS.WHITE,
                            fontSize: 18,...styles.textFont}} >Next</Text>
                        </Block>
                    </Button>
                </Block>
                
            </Block>
        );
    }

    //Post Form ===>>> 2
    const photoUpload = () => {
        return(
            <Block middle flex={1}>
                {
                    rUpload && rUpload.length > 0 ?
                    <Block flex={1}>
                        <ScrollView
                            onScroll={() => setOnImgScroll(true)}
                            horizontal
                            style={{backgroundColor: argonTheme.COLORS.GRADIENT_START}}
                            pagingEnabled={true}
                            decelerationRate={0}
                            scrollEventThrottle={16}
                            snapToAlignment="left"
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width - theme.SIZES.BASE}>
                            {
                            rUpload.map((el, index) =><Block key={el.uri} style={{ flex: 1 }}>
                            <Image
                                resizeMode='cover'
                                source={{ uri: el.uri }}
                                style={{ width: width - theme.SIZES.BASE, height: 230, flex: 1 }}
                            />
                            </Block>)
                            }
                        </ScrollView>
                    </Block>
                    :
                    <Block middle center >
                        <TouchableOpacity onPress={() => navigation.navigate('Upload', {incomingRoute: navigation.state.routeName})}>
                            <Block middle style={{...styles.social, ...styles.shadow }}>
                                <EvilIcons name="camera" size={theme.SIZES.BASE * 4.625} color={argonTheme.COLORS.GRADIENT_START} />
                            </Block>
                        </TouchableOpacity>
                    </Block>
                }
                {
                    rUpload && rUpload.length > 1 && onImgScroll === false ?
                    <Block row style={{position: 'absolute', right: 0, justifyContent:'center', backgroundColor:'#FFF', padding: 8}}>
                        <Text style={{marginRight: 5, color:argonTheme.COLORS.GRADIENT_END, fontFamily:'regular', fontSize:18 }}>{`Swipe 1 of ${rUpload.length}`}</Text>
                    </Block> : null
                }
                <Block row style={{position: 'absolute', bottom: -15, alignItems:'center'}}>
                    {
                        rUpload && rUpload.length > 0 ?
                        <Button shadowless={true} onPress={() => vType(2)}
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
    const postTitle = () =>{
        return(
            <Block style={{flex:1, justifyContent:'space-around'}} >
                <Block>
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={14}
                        lborder={true}
                        label = 'Post Title'
                        value={ntitle !== null ? ntitle.replace(/[^a-z,A-Z,\s]/g,''): ''}
                        onChangeText={text => { setNtitle(text.replace(/[^a-z,A-Z,\s]/g,'')) }}
                        autoCompleteType = "name"
                        autoCapitalize = "sentences"
                        returnKeyType="next"
                        style={{fontSize: 15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                </Block>
                <KeyboardAvoidingView enabled={true}
                    style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : null}>
                    <SafeAreaView style={{flex:1, justifyContent:'space-around'}}>
                        <Block>
                            <FInput
                                ww
                                lcolor={argonTheme.COLORS.GRADIENT_START}
                                lfont={14}
                                label = 'Enter short description here...'
                                lborder={true}
                                value={nshort !== null ? nshort.replace(/[^a-z,A-Z,\s]/g,''): ''}
                                onChangeText={text => { setNshort(text.replace(/[^a-z,A-Z,-,\s]/g,'')) }}
                                autoCompleteType = "name"
                                autoCapitalize = "sentences"
                                multiline={true}
                                numberOfLines = {4}
                                onSubmitEditing={() => {
                                    if (!nshort.endsWith("\n")) {
                                    let postText = nshort;
                                    postText = postText + "\n";
                                    setNshort(postText)
                                    }
                                }}
                                returnKeyType= {Platform.OS==='ios'?'default':'none'}
                                style={{fontSize: 15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START, height: 90}}
                            />
                        </Block>
                    </SafeAreaView>
                </KeyboardAvoidingView>
                <Block center row style={{position: 'absolute', bottom: -15, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => vType(3)}
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
    const pricing = () => {
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block style={{flex:0.9, justifyContent:'space-around', marginBottom:25}}>
                <Block>
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={14}
                        lborder={true}
                        label = 'Unit Price (e.g. 20.00)'
                        value={nprice !== null ? nprice.replace(/[^0-9]/g,''): ''}
                        onChangeText={text => { setNprice(text.replace(/[^0-9]/g,'')) }}
                        autoCompleteType = "off"
                        autoCorrect={false}
                        returnKeyType="next"
                        keyboardType = { Platform.OS === 'android' ? "number-pad" : "numbers-and-punctuation" }
                        style={{fontSize: 15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                </Block>
                <Block>
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={14}
                        lborder={true}
                        label = 'Discount Price (If Available - e.g. 10%)'
                        value={nDiscount !== null ? nDiscount.replace(/[^0-9]/g,''): ''}
                        onChangeText={text => { setNDiscount(text.replace(/[^0-9]/g,'')) }}
                        autoCompleteType = "off"
                        autoCorrect={false}
                        keyboardType = { Platform.OS === 'android' ? "number-pad" : "numbers-and-punctuation" }
                        returnKeyType="next"
                        style={{fontSize: 15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                </Block>
                <Block>
                    <KeyboardAvoidingView enabled={true} behavior={Platform.OS === "ios" ? "padding" : null} >
                    <FInput
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={14}
                        lborder={true}
                        label = 'Url Link (e.g. google.com/me)'
                        value={nlink !== null ? nlink: ''}
                        onChangeText={text => { setNlink(text) }}
                        autoCompleteType = "off"
                        autoCorrect={false}
                        returnKeyType="next"
                        style={{fontSize: 15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}
                    />
                    </KeyboardAvoidingView>
                </Block>
                </Block>
                <Block style={{flex:0.1, justifyContent:'space-around', zIndex:0, backgroundColor:'red'}}></Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => vType(4)}
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
    const generalDescrpt = () => {
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block>
                    <KeyboardAvoidingView enabled={true} behavior={Platform.OS === "ios" ? "padding" : null} >
                    <FInput
                        iAnimate ={{outputRange: 125, paddingTop: 95}}
                        ww
                        lcolor={argonTheme.COLORS.GRADIENT_START}
                        lfont={14}
                        label = 'Enter Long description here...'
                        lborder={true}
                        value={nDesc !== null ? nDesc.replace(/[^a-z,A-Z,\s]/g,''): ''}
                        onChangeText={text => { setNDesc(text.replace(/[^a-z,A-Z,-,\s]/g,'')) }}
                        autoCompleteType = "name"
                        autoCapitalize = "sentences"
                        multiline={true}
                        numberOfLines = {4}
                        returnKeyType= {Platform.OS==='ios'?'default':'none'}
                        style={{fontSize: 15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START, height:'70%'}}
                    />
                    </KeyboardAvoidingView>
                </Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => vType(5)}
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
    const nbtnCatList = () => {
        let btnCatList = [{label: 'Buy Now', value:'buynow'}, {label: 'Call Now', value:'callnow'}, {label: 'Register Now', value:'regnow'}, {label: 'Book Appointment', value:'bookappointment'}, {label: 'Pre-Order', value:'pre-order'}, {label: 'Reserve Spot', value:'reserveSpot'}];
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block style={{flex:1, paddingHorizontal: 10}}>
                    <Block flex={1} style={{ alignItems:'flex-start'}}>
                        <Block style={{flex: 0.1, marginTop:-8, zIndex:11, marginBottom:10,}}>
                            <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.PRIMARY}}>Select Preferred Button Type:</Text>
                        </Block>
                        <Block flex={0.9} style={{ paddingHorizontal: 10, }}>
                            <RadioButton options={btnCatList} onChange={value => categorization(value)}/>
                        </Block>
                    </Block>
                </Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => vType(7)}
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
    const actionList = () => {
        const stringLength = data => {
            const rData = data.split('|')[1].trim().length <= 14 ? data.split('|')[1].trim() : `${data.split('|')[1].trim().substring(0,14)}...`;
            return rData;
        }
        const showTagList=[];
        tagList ? tagList.map(el => showTagList.push({label: el.name, value: `${el._id}|${el.name}`, key:el._id })): {}
        return(
            <Block style={{flex:1, justifyContent:'space-around'}}>
                <Block style={{marginTop:5, borderBottomWidth:1, borderColor:'rgb(114,114,114)', flex:0.1, marginBottom:15}}>
                    <RNPickerSelect
                        useNativeAndroidPickerStyle={false}
                        textInputProps={{fontSize: 21,}}
                        style={{...styles.inputSelect,
                        placeholder: {fontSize: 21, color:argonTheme.COLORS.PRIMARY} }}
                        onValueChange={value => pushTagSelect(value)}
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
                            nTag.map((el, i) =>
                                <Block style={{margin: 5, marginRight:14, width:theme.SIZES.BASE*9, borderWidth: StyleSheet.hairlineWidth, height: 30,
                                borderColor:argonTheme.COLORS.INFO, paddingLeft:3, }} key={i}>
                                    <Block flex={1} row style={{justifyContent:'center'}}>
                                        <Block flex={0.8} style={{justifyContent:'center', overflow:'hidden'}}>
                                            <Text style={{fontFamily:'regular', color: argonTheme.COLORS.PRIMARY}}>1</Text>
                                        </Block>
                                        <Block flex={0.2} style={{justifyContent:'center', backgroundColor:'red'}} >
                                            <TouchableCmp shadowless  onPress={() => removeTagSelect(el)}>
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
                            )
                        }
                </Block>
                <Block center row style={{position: 'absolute', bottom: -13, alignItems:'center'}}>
                    <Button shadowless={true} onPress={() => vType(6)}
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
    

    //Screen to Display in Form
    const screen = () => {
        switch (dType) {
          case 0:
            return actionList(); //npostType();
          case 1:
            return photoUpload();
          case 2:
            return postTitle();
          case 3:
            return pricing();
          case 4:
            return generalDescrpt();
          case 5:
            return actionList();
          case 6:
            return nbtnCatList();
          case 6:
            return nbtnCatList();
          default:
            return;
        }
    }

    return (
        <Block flex style={styles.profile}>
            <Block flex>
            <ImageBackground
                source={Images.ProfileBackground}
                style={styles.profileContainer}
                imageStyle={styles.profileBackground}
            >
                <ScrollView 
                showsVerticalScrollIndicator={false}
                style={{ width, marginTop: '25%' }}
                >
                <Block flex style={styles.profileCard}>
                    <Block middle style={styles.avatarContainer}>
                    <Image
                        source={{ uri: Images.ProfilePicture }}
                        style={styles.avatar}
                    />
                    </Block>
                    <Block style={styles.info}>
                    <Block
                        middle
                        row
                        space="evenly"
                        style={{ marginTop: 20, paddingBottom: 24 }}
                    >
                        <Button onPress={createNewPost}
                        shadowless={true}
                        style={{width:width/2, backgroundColor: Platform.OS==='android'?argonTheme.COLORS.GRADIENT_START:'transparent' }}
                        >
                            <Block row>
                                <Ionicons
                                style={{marginRight: 10}}
                                name={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
                                size={16}
                                color= {Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_START}
                                />
                                <Text style={{ color: Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_START,
                                fontSize: 16,...styles.textFont}} >New Posting</Text>
                            </Block>
                        </Button>
                    </Block>
                    <Block row space="between">
                        <TouchableOpacity>
                            <Block middle>
                            <Text
                                size={12}
                                color="#525F7F"
                                style={{...styles.textFont, marginBottom: 4 }}
                            >
                                2K
                            </Text>
                            <Text style={styles.textFont} size={12} color={argonTheme.COLORS.GRADIENT_START}>Orders</Text>
                            </Block>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Block middle>
                            <Text
                                color="#525F7F"
                                size={12}
                                style={{ marginBottom: 4 }}
                            >
                                10
                            </Text>
                            <Text style={styles.textFont} size={12} color={argonTheme.COLORS.GRADIENT_START}>Pending</Text>
                            </Block>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Block middle>
                            <Text
                                color="#525F7F"
                                size={12}
                                style={{ ...styles.textFont, marginBottom: 4 }}
                            >
                                89
                            </Text>
                            <Text style={styles.textFont} size={12} color={argonTheme.COLORS.GRADIENT_START}>Postings</Text>
                            </Block>
                        </TouchableOpacity>  
                    </Block>
                    </Block>
                    <Block flex>
                        <Block middle style={{ marginTop: 5, marginBottom: 3 }}>
                            <Block style={styles.divider} />
                        </Block>
                        <Block row style={{ paddingVertical: 14, alignItems: "baseline" }} >
                            <Text style={styles.textFont} size={16} color={argonTheme.COLORS.GRADIENT_START}>
                                My Postings ({totalPosts})
                            </Text>
                        </Block>
                        <Block row style={{ paddingBottom: 20, justifyContent: "flex-end" }}>
                            <TouchableOpacity shadowless style={styles.filterViewBtn} onPress={viewType}>
                                {
                                    viewsType ? 
                                <Block row space="between" style={{ marginTop: 20, paddingBottom: 5}} >
                                    <Ionicons size={14} name={Platform.OS === 'android' ? 'md-grid' : 'ios-grid'}
                                    color={argonTheme.COLORS.GRADIENT_START} 
                                    style={{paddingTop: Platform.OS === 'android' ? 2.5 : 1.5}}/>
                                    <Text size={16} color={argonTheme.COLORS.GRADIENT_START}>Grid View</Text>
                                </Block> :
                                <Block row space="between" style={{ marginTop: 20, paddingBottom: 5}} >
                                    <Ionicons size={14} name={Platform.OS === 'android' ? 'md-list' : 'ios-list'}
                                    color={argonTheme.COLORS.GRADIENT_START} 
                                    style={{paddingTop: Platform.OS === 'android' ? 2.5 : 1.5}}/>
                                    <Text size={16} color={argonTheme.COLORS.GRADIENT_START}>List View</Text>
                                </Block>
                                }
                            </TouchableOpacity>
                        </Block>
                        <Block style={{ paddingBottom: -HeaderHeight * 2}}>
                        {
                            viewsType ? 
                            <FlatList
                                style={{flex: 1}}
                                onRefresh={loadPosts}
                                refreshing={isRefreshing}
                                horizontal={false}
                                data={posts}
                                keyExtractor={pp => pp._id}
                                renderItem={pdtt => (
                                    <ColumnGrid imgUrl={pdtt.item.imageUrl} 
                                    titleLabel={pdtt.item.title} userImg={Odb.dbUrl + pdtt.item.creator.img[0]} 
                                    userName = {pdtt.item.creator.displayName}
                                    type='owner' headerPress={() => headerPress(pdtt.item)} />
                                )}
                            /> : 
                            <Block row space="between" style={{ flexWrap: "wrap" }}>
                            {posts.map((img, imgIndex) => (
                             <Thumbnails imgUrl={Odb.dbUrl + img.imageUrl[0]} key={img._id}/>
                            ))}
                          </Block>
                        }
                        </Block>
                    </Block>
                    
                </Block>
                <Block style={{marginBottom: Platform.OS === 'android' ? 
                    height < 700 ? '27%' : '23%' : height < 700 ? '23%' : '23%'}}></Block>
                </ScrollView>
            </ImageBackground>
            </Block>
            {
                options ?
                <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
                    <Block style={{...styles.floatInside, height: Platform.OS==='android'?240:250, paddingHorizontal: 0, marginBottom: 15}}>
                        <Block>
                            <TouchableCmp shadowless style={styles.optionBtn}>
                                <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                                borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                                <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}>Delete</Text>
                                </Block>
                            </TouchableCmp>
                            <TouchableCmp shadowless style={styles.optionBtn} onPress={shareHeaderPress}>
                                <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                                borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%' }}>
                                <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Share...</Text>
                                </Block>
                            </TouchableCmp>
                            <TouchableCmp shadowless style={styles.optionBtn}>
                                <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                                borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%' }}>
                                <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Edit Post</Text>
                                </Block>
                            </TouchableCmp>
                            <TouchableCmp shadowless style={styles.optionBtn}>
                                <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                                borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%' }}>
                                <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Manage Inventory</Text>
                                </Block>
                            </TouchableCmp>
                            <TouchableCmp shadowless style={{...styles.optionBtn}} onPress={headerPressCancel}>
                                <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 10 }}>
                                <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Manage Availability</Text>
                                </Block>
                            </TouchableCmp>
                        </Block>
                    </Block>
                    <Block style={{...styles.floatInside, height: 50, paddingVertical: 10, marginBottom: Platform.OS==='android' ? 100 : 95}}>
                        <Block>
                            <TouchableCmp shadowless style={{...styles.optionBtn, marginTop:0,}} onPress={headerPressCancel}>
                                <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 5 }}>
                                <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Cancel</Text>
                                </Block>
                            </TouchableCmp>
                        </Block>
                    </Block>
                </Block>
                :
                null
                }
                {newPost ?
                <Block shadow={true} shadowColor='black' center style={{...styles.float}} justifyContent='center' alignItems='center'>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} flex={1}>
                    <Block style={{...styles.floatInside, paddingVertical:0, alignItems: 'center', height: (height * 0.56 ), backgroundColor:'rgba(151,101,195,0.4)', overflow:'hidden'}}>
                        <Block row flex={0.25} style={{width:width-theme.SIZES.BASE,backgroundColor:'white'}}>
                            <Block flex={1.8} style={{justifyContent:'center', alignItems:'center'}}>
                                <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{helpers[dType]}</Text>
                            </Block>
                            <Block flex={0.2} style={{justifyContent:'center', alignItems:'center'}}>
                                <TouchableCmp shadowless onPress={closeNewPost}>
                                    <Ionicons
                                        style={{marginRight: 10}}
                                        name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                                        size={18}
                                        color= {argonTheme.COLORS.GRADIENT_START}
                                    />
                                </TouchableCmp>
                            </Block>
                        </Block>
                        <Block flex={1.5} style={{width:width-theme.SIZES.BASE, marginTop: 5, 
                            backgroundColor:'rgba(244,239,249,0.8)', paddingVertical:20, paddingHorizontal:8}}>
                                {screen()}
                        </Block>
                        <Block flex={0.2} style={{width:width-theme.SIZES.BASE,backgroundColor:'white', 
                        marginTop:5, justifyContent:'center', alignItems:'center'}}>
                            <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{`Step ${dType+1} of 6`}</Text>
                        </Block>
                    </Block>
                    </TouchableWithoutFeedback>
                </Block>
                :
                null
                }
        </Block>
    );
};


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
        marginTop:5,
        justifyContent: 'center',
        alignItems: 'center',
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
        zIndex: 1
    },
    filterViewBtn: {
        width: '25%'
    },
    profileBackground: {
        width: width,
        height: height / 2
    },
    profileCard: {
        // position: "relative",
        padding: theme.SIZES.BASE,
        marginHorizontal: theme.SIZES.BASE,
        marginTop: 65,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        backgroundColor: theme.COLORS.WHITE,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        shadowOpacity: 0.2,
        elevation: 5,
        zIndex: 2
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
        width: "90%",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#c3a7dd'
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
    }
    });

export default Postings;

