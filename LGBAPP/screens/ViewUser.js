import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView, TouchableNativeFeedback,
  Image, FlatList,
  ImageBackground, TouchableOpacity,
  Platform, KeyboardAvoidingView
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import * as profileActions from '../store/actions/editProfile';
import * as postActions from '../store/actions/posting';
import { DrawerItems } from "react-navigation";
import { FInput, Button, Spinner } from "../components";
import Thumbnails from "../components/Thumbnail";
import ColumnGrid from "../components/ColumnGrid";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import { Odb } from "../actionable";


const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

let TouchableCmp = TouchableOpacity;

if (Platform.OS === 'android' && Platform.Version >= 5) {
    TouchableCmp = TouchableNativeFeedback;
}

class ViewProfile extends React.Component {
  state = {
    profile: null,
    loading: false,
    error: false,
    errs: null,
    sDescription: null,
    describe: false,
    pager: 1,
    viewsType: false,
    isRefreshing: false,
    options: false,
    optionValue: null,
  }
  async componentWillMount() {
    await this.getProfile();
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

  headerPress = async data => {
    await this.setState({options: true, optionValue: data})
    console.log(data);
    return;
  }
  headerPressCancel = async() => {
    await this.setState({options: false, optionValue: null})
    return;
  }

  getProfile = async() => {
    console.log('tolu')
    this.setState({loading:true, error: false, isRefreshing:true});
    try {
      await this.props.profileActions.fetchUser();
      await this.props.postActions.fetchPosts();
      await this.setState({pager: this.state.pager+1});
      this.setState({loading: false, isRefreshing:false});
      return;
    }catch(err) {
      this.setState({loading: false, error: true, errs: err.message});
    }
  }
  render() {
    const { img, lname, fname, dob, city, desc } = this.props.rProfile;
    const userNamet = `${fname} ${lname}, ${moment().diff(dob, 'years',false)}`;  
    const userCtry = this.props.userCountry === null || this.props.userCountry === undefined ? null : this.props.userCountry.name
    const uLocation = `${city}, ${userCtry}`;
    const uDesc = !desc ? `Hi ${fname}, you can describe yourself here...`: desc;
    const totalUserPosts = !this.props.totalUserPost? '0': this.props.totalUserPost;
    // console.log(this.props.totalUserPost);
    // console.log(this.state.pager);
    // console.log(this.state.loading);
    if(this.state.error === true) {
      return (
        <Block flex={1} style={{alignItems:'center', justifyContent:'center', height, width}}>
          <Text size={20} style={{...styles.textFont, marginBottom:5}}>{this.state.errs}</Text>
          <Button shadowless onPress={this.getProfile} style={styles.errBtn}>
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
          this.state.loading===true ? <Block center style={{ position:'absolute', bottom: 180, zIndex:10 }}><Spinner color={argonTheme.COLORS.GRADIENT_START}/></Block>:null
        }
        <Block flex>
          <ImageBackground
            source={Images.ProfileBackground}
            style={styles.profileContainer}
            imageStyle={styles.profileBackground}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, marginTop: '25%' }}
              bounces={true}
              alwaysBounceVertical={true}
            >
              <Block flex style={styles.profileCard}>
                <Block middle style={styles.avatarContainer}>
                  <Image
                    source={{ uri: Odb.dbUrl+img }}
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
                    <Button
                      small
                      style={{ backgroundColor: argonTheme.COLORS.INFO }}
                    >
                      CONNECT
                    </Button>
                    <Button
                      small
                      style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }}
                    >
                      CHAT
                    </Button>
                  </Block>
                  <Block row space="between">
                    <Block middle>
                      <Text
                        bold
                        size={12}
                        color="#525F7F"
                        style={{ marginBottom: 4, ...styles.textFont }}
                      >
                        {this.manageNumbers(parseInt(totalUserPosts))}
                      </Text>
                      <Text size={12} style={{ ...styles.textFont}}>Posts</Text>
                    </Block>
                    <Block middle>
                      <Text
                        bold
                        color="#525F7F"
                        size={12}
                        style={{ marginBottom: 4, ...styles.textFont }}
                      >
                        {this.manageNumbers(parseInt('5006789'))}
                      </Text>
                      <Text size={12} style={{ ...styles.textFont}}>Connections</Text>
                    </Block>
                    <Block middle>
                      <Text
                        bold
                        color="#525F7F"
                        size={12}
                        style={{ marginBottom: 4, ...styles.textFont }}
                      >
                        {this.manageNumbers(parseInt('50000'))}
                      </Text>
                      <Text size={12} style={{...styles.textFont}}>Connect</Text>
                    </Block>
                  </Block>
                </Block>
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                    <Text bold size={26} color="#32325D" style={{fontFamily:'bold'}}>
                      {userNamet}
                    </Text>
                    <Text size={15} color="#32325D" style={{ marginTop: 10, ...styles.textFont }}>
                      {uLocation}
                    </Text>
                  </Block>
                  <Block middle style={{ marginTop: 30, marginBottom: 16 }}>
                    <Block style={styles.divider} />
                  </Block>
                  <Block middle>
                    <Text
                      size={15}
                      color="#525F7F"
                      style={{ textAlign: "center", ...styles.textFont }}
                    >
                      {uDesc}
                    </Text>
                    {
                      !desc  ? 
                    <Button
                      onPress={() =>this.setState({describe:true})}
                      shadowless={true}
                      color="transparent"
                      style={{ marginTop: Platform.OS==='android'?10:0, width:width/2}}
                      textStyle={{
                        color: "#233DD2",
                        fontWeight: "500",
                        fontSize: 16,
                        ...styles.textFont
                      }}
                    >
                       Edit Profile
                    </Button>
                    :
                    null
                    }
                  </Block>
                  <Block
                    row
                    style={{ paddingVertical: 14, alignItems: "baseline" }}
                  >
                    <Text bold size={16} color="#525F7F" style={{...styles.textFont}}>
                      My Post
                    </Text>
                  </Block>
                  <Block
                    row
                    style={{ paddingBottom: 20, justifyContent: "flex-end" }}
                  >
                    <Button
                      onPress={()=> this.setState({viewsType: !this.state.viewsType})}
                      shadowless={true}
                      small
                      color="transparent"
                      textStyle={{ color: "#5E72E4", fontSize: 12, ...styles.textFont }}
                    >
                      {this.state.viewsType ? 'View Less' : 'View all'} 
                    </Button>
                  </Block>
                  <Block style={{ paddingBottom: -HeaderHeight * 2}}>
                    {
                      this.state.viewsType ? 
                      <FlatList
                          style={{flex: 1}}
                          onRefresh={this.props.postActions.fetchPosts}
                          refreshing={this.state.isRefreshing}
                          onEndReached={this.props.postActions.fetchPosts}
                          onEndReachedThreshold={1.5}
                          initialNumToRender={2}
                          horizontal={false}
                          data={this.props.userPost}
                          keyExtractor={pp => pp._id}
                          renderItem={pdtt => (
                              <ColumnGrid imgUrl={Odb.dbUrl + pdtt.item.imageUrl[0]} 
                              titleLabel={pdtt.item.title} userImg={Odb.dbUrl + pdtt.item.creator.img[0]} 
                              userName = {pdtt.item.creator.displayName}
                              type='owner' headerPress={() =>this.headerPress(pdtt.item._id)} />
                          )}
                      /> : 
                      <Block row space="between" style={{ flexWrap: "wrap" }}>
                      {this.props.userPost.map((img, imgIndex) => (
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
          this.state.options ?
          <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
            <Block style={{...styles.floatInside, paddingHorizontal: 0, marginBottom: Platform.OS==='android' ? 50 : 18}}>
              <Block>
                <TouchableCmp shadowless style={styles.optionBtn}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ERROR}}>Delete</Text>
                  </Block>
                </TouchableCmp>
                <TouchableCmp shadowless style={styles.optionBtn}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 13, width:'100%' }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Share</Text>
                  </Block>
                </TouchableCmp>
                <TouchableCmp shadowless style={styles.optionBtn} onPress={this.headerPressCancel}>
                  <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 10 }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Cancel</Text>
                  </Block>
                </TouchableCmp>
              </Block>
            </Block>
          </Block>
          :
          null
        }
        {this.state.describe ?
          <Block shadow={true} shadowColor='black' center style={styles.float} justifyContent='center' alignItems='center'>
            <Block style={{...styles.floatInside, alignItems: 'center'}}>
              <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior="padding"
                  enabled
                >
                <FInput
                  ww
                  lcolor={argonTheme.COLORS.GRADIENT_START}
                  lfont={14}
                  label = 'Enter description here...'
                  lborder={true}
                  value={this.state.sDescription !== null ? this.state.sDescription.replace(/[^a-z,A-Z,\s]/g,''): ''}
                  onChangeText={text => { this.setState({sDescription: text.replace(/[^a-z,A-Z,\s]/g,'')}) }}
                  autoCompleteType = "name"
                  autoCapitalize = "sentences"
                  multiline={true}
                  numberOfLines = {3}
                  style={{fontSize: 14, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START, height: 50}}
                />
                <Block row style={{alignContent:'flex-end', width:'100%'}}>
                  <Button shadowless={true} small style={{width:width/4, marginTop: 5, marginRight: 10,
                  backgroundColor: Platform.OS==='android'?argonTheme.COLORS.GRADIENT_START:'transparent' }}>
                    <Block row style={{justifyContent:'center', alignItems:'center'}}>
                        <Ionicons
                        style={{marginRight: 10}}
                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                        size={16}
                        color= {Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_START}
                        />
                        <Text style={{ color: Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_START,
                        fontSize: 16,...styles.textFont}} >Submit</Text>
                    </Block>
                  </Button>
                  <Button shadowless={true} small style={{width:width/4, marginTop: 5,
                  backgroundColor: Platform.OS==='android'?argonTheme.COLORS.GRADIENT_START:'transparent' }} onPress={() => this.setState({describe:false})}>
                    <Block row style={{justifyContent:'center', alignItems:'center'}} >
                        <AntDesign
                        style={{marginRight: 10}}
                        name='close'
                        size={16}
                        color= {Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_START}
                        />
                        <Text style={{ color: Platform.OS==='android' ? "#FFF": argonTheme.COLORS.GRADIENT_START,
                        fontSize: 16,...styles.textFont}} >Cancel</Text>
                    </Block>
                  </Button>

                </Block>
              </KeyboardAvoidingView>
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
    marginBottom: 15, 
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
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
    zIndex: 0
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
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
    borderWidth: 1,
    borderColor: "#E9ECEF"
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
  errBtn:{
    width: theme.SIZES.BASE * 8,
    backgroundColor: Platform .OS==='android' ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
});

const mapStateToProps = function(state) {
  return {
    rProfile: state.profile.profile,
    userCountry: state.profile.userCountry,
    userPost: state.posting.availablePosts,
    totalUserPost: state.posting.totalPost
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    postActions: bindActionCreators(postActions, dispatch),
    profileActions: bindActionCreators(profileActions, dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(ViewProfile);


