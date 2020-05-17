import React from "react";
import {
  StyleSheet,
  Dimensions, Share,
  ScrollView, TouchableNativeFeedback,
  Image, FlatList,
  ImageBackground, TouchableOpacity,
  Platform, KeyboardAvoidingView, Alert,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import * as profileActions from '../store/actions/editProfile';
import * as postActions from '../store/actions/posting';
import * as dash from '../store/actions/dashboard';
import { FInput, Button, Spinner, ProfileAlert } from "../components";
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

class Profile extends React.Component {
  _isMounted = false;
  constructor(props){
    super(props);
    this.state = {
      isOverlayVisible:false,
      profile: null,
      anotherUser: null,
      connectId: null,
      loading: false,
      error: false,
      errs: null,
      sDescription: null,
      describe: false,
      pager: 0,
      viewsType: false,
      isRefreshing: false,
      options: false,
      optionValue: null,
      submitting:false,
      deleted:false,
      moreloader: false,
      loadingInfo:null,
      errWait: 0,
      editPhotoBtn: false,
      submittingPhoto: false,
    }
    this.productSelect = this.productSelect.bind(this);
    this.chatLink = this.chatLink.bind(this);
    this.connectNew = this.connectNew.bind(this);
    this.disconnectNew = this.disconnectNew.bind(this);
    this.chatNavFunction = this.chatNavFunction.bind(this);
    this.acceptNewConnection = this.acceptNewConnection.bind(this);
    this.mutualConnection = this.mutualConnection.bind(this);
    this.getOtherUsers = this.getOtherUsers.bind(this);
    this.newConnectionDisplay = this.newConnectionDisplay.bind(this)
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.getProfile();
    await this.getMyConnection();
    // await this.props.dash.checkSockets();
    return;
  }

  async componentDidUpdate(prevProps) {
    if (this.props.managedProfileState !== prevProps.managedProfileState) {
      await this.getOtherUsers();
    }
    if(this.props.newConnect !== prevProps.newConnect){
      await this.checkNewConnect();
    }
    if(this.props.socket_newUser !== prevProps.socket_newUser){
      await this.getMyConnection();
    }
    if(this.props.socket_updateUser !== prevProps.socket_updateUser){
     await this.newConnectionDisplay();
    }
    return;
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  checkNewConnect = async() =>{
    if(this.props.newConnect.length > 0){
      this.props.newConnect.forEach(el => {
        const namet = !el.connector.bizname || el.connector.bizname === 'null' ? el.connector.displayName : el.connector.bizname;
        return Services.allAlerts(Alert,'Connect Option', `How will you like to connect with ${namet}.`, 
        'Mutual', 'default', this.mutualConnection, 'Accept', this.acceptNewConnection,true,true,'Ignore', this.disconnectNew,el.connector,el._id);
      })
      return;
    }
  }

  newConnectionDisplay = async() => {
    if(!this.props.socket_updateUser){
      return;
    }
    await this.props.dash.removeSocketUpdate();
    await this.getMyConnection();
  }

  productSelect = async(item) => {
    const {category, stype } = item;
    await this.props.dash.storeView(item);
    if(!stype || stype === 'Found'){
      await this.props.dash.storedSearches([category]);
      return this.props.navigation.navigate("Categories", {headName:category.name, idToFind:category._id, routeKey:this.props.navigation.state.routeName});
    }else{
      return this.props.navigation.navigate('Product');
    }
  }

  disconnectNew = async(el,xx) =>{
    const xk = xx;
    const { displayName, bizname, } = !el ? this.state.anotherUser : el;
    try{
      await this.props.profileActions.updateConnection(el._id, xx,false,false,true,this.props.rProfile.displayName);
     Services.allAlert(Alert,'Status', `You are now disconnected from ${!bizname || bizname==='null' ? displayName : bizname}.`, 'OK', 'default', this.returnUser, false);
     return await this.props.profileActions.emptyConn(xk);
    }catch(err){
      return Services.allAlert(Alert,'Error', `${err.message}`, 'Try Again', 'destructive', this.disconnectNew, true);
    }
  }

  connectNew = async() => {
    const { displayName, bizname, _id } = this.state.anotherUser;
    try{
      await this.props.profileActions.createConnection(_id);
      return Services.allAlert(Alert,'Status', `You are now connected to ${!bizname || bizname==='null' ? displayName : bizname}. You'll be notified when your request is accepted.`, 'OK', 'default', this.returnUser, false);
    }catch(err){
      return Services.allAlert(Alert,'Error', `Cannot connect to ${!bizname || bizname==='null' ? displayName : bizname}`, 'Try Again', 'destructive', this.connectNew, true);
    }
  }

  mutualConnection = async(el,x) => {
    const xk = x;
    const { displayName, bizname, } = el;
    console.log(xk);
    try{
      await this.props.profileActions.updateConnection(el._id, x,true,true,false,this.props.rProfile.displayName);
      Services.allAlert(Alert,'Status', `Connection to ${!bizname || bizname==='null' ? displayName : bizname} is now mutual.`, 'OK', 'default', this.getMyConnection, false);
      return await this.props.profileActions.emptyConn(xk);
    }catch(err){
      return Services.allAlert(Alert,'Error', `${err.message}`, 'Try Again', 'destructive', this.mutualConnection, true);
    }
  }

  acceptNewConnection= async(el,x) => {
    const xk = x;
    const { displayName, bizname, } = el;
    try{
      await this.props.profileActions.updateConnection(el._id, x,true,false,false,this.props.rProfile.displayName);
      await this.props.profileActions.emptyConn(xk);
      return Services.allAlert(Alert,'Status', `You are now connected with ${!bizname || bizname==='null' ? displayName : bizname}.`, 'OK', 'default', this.getMyConnection, false);
    }catch(err){
      return Services.allAlert(Alert,'Error', `${err.message}`, 'Try Again', 'destructive', this.acceptNewConnection, true);
    }
  }

  getOtherUsers = async() => {
    this._isMounted === true
    let goPage, token;
    const { connectionConnectItem, routeKey  } = this.props.managedProfileState;
    if(connectionConnectItem) {
      try {
        const connItem = await Services.profileCheckMutual(connectionConnectItem);
        this.setState({error: false,anotherUser:connItem.connect, connectId:connItem._id, loading: true, loadingInfo:`Loading ${connItem.connect.fname}'s Profile`});
          token = this.props.token ? this.props.token : null
          if(this.state.errWait > 0 ){
            setTimeout(async() => {
              await this.props.profileActions.prefillFriendsConnections(token, 1, connItem.connect._id);
              setTimeout(() => {
                this.setState({loading:false, viewsType: true, errWait:0})
              },4000)
            }, this.state.errWait)
          } else {
            await this.props.profileActions.prefillFriendsConnections(token, 1, connItem.connect._id);
            setTimeout(() => {
              if(this._isMounted === true){
                this.setState({loading:false, viewsType: true, errWait:0})
              }
            },4000)
          }
          return;
      }catch(err) {
        if(this._isMounted === true){
          this.setState({loading: false, loadingInfo:null, errs:err.message, error:true, errNum: 4, errWait:4500});
        }
      }
      return;
    }
    return setTimeout(() => {
      if(this._isMounted === true){
        this.setState({anotherUser:null}, () => {
          this.props.navigation.setParams({headerTitle: 'MySelf', goBackLast:false, routeKey:null});
        });
      }
    }, 4500); 
  }

  returnUser = async() => {
    this.setState({anotherUser:null});
    await this.props.profileActions.emptyFriendsPrefill();
    return;
  }

  submitDescription = async() => {
    this._isMounted === true
    this.setState({loading:true, loadingInfo:'Submitting data', errWait:0})
    try {
      if(this.state.errWait > 0 ){
        this.setState({error: false});
        setTimeout(async() => {
          await this.props.profileActions.submitDescription(this.props.token, this.state.sDescription)
          setTimeout(() => {
            if(this._isMounted === true){
              this.setState({loading:false, loadingInfo:null, describe:false, errWait:0})
            }
          },1000)
        }, this.state.errWait)
      } else {
        await this.props.profileActions.submitDescription(this.props.token, this.state.sDescription)
        setTimeout(() => {
          if(this._isMounted === true){
            this.setState({loading:false, loadingInfo:null, describe:false, errWait:0})
          }
        },1000)
      }
      return;
    } catch(err) {
      if(this._isMounted === true){
        this.setState({loading: false, describe:false, loadingInfo:null, errs:err.message, error:true, errNum: 5, errWait:4500});
      }
    }
  }

  goFindPhoto = () => {
    return this.props.navigation.navigate('Settings');
  }

  tryAgainButton = (data) => {
    console.log(this.state.errNum);
    if(this.state.errNum === null) {
        return;
    }
    if(this.state.errNum === 1) {
      return this.getProfile();
    }
    if(this.state.errNum === 2) {
        return this.getMyConnection();
    }
    if(this.state.errNum === 3) {
        return this.loadMorePost();
    }
    if(this.state.errNum === 4) {
      return this.getOtherUsers();
    }
    if(this.state.errNum === 5) {
      return this.submitDescription();
    }
    if(this.state.errNum === 6) {
      return this.deleteUserPost();
    }
    if(this.state.errNum === 7) {
      return this.changeUserPhoto();
    }
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
    return;
  }
  headerPressCancel = async() => {
    await this.setState({options: false, optionValue: null})
    return;
  }



  getProfile = async() => {
    let goPage
    if(this.state.submitting) {
      this.setState({submitting:false});
      return;
    }
    else {
      this.setState({loading:true, error: false, isRefreshing:true});
      try {
        await this.props.profileActions.fetchUser();
        if(this.props.userPost.length <= 0){
          goPage = await this.props.goPager;
          if(!goPage) {
              goPage = 1;
          }
          if(this.state.errWait > 0 ){
            this.setState({error: false});
            setTimeout(async() => {
              await this.props.postActions.fetchPosts(goPage);
              if(this._isMounted === true){
                this.setState({loading: false, isRefreshing:false, errWait:0, pager: this.state.pager < goPage ? goPage:this.state.pager});
              }
            }, this.state.errWait)
          } else {
            await this.props.postActions.fetchPosts(goPage);
            if(this._isMounted === true){
              this.setState({loading: false, isRefreshing:false, errWait:0, pager: this.state.pager < goPage ? goPage:this.state.pager});
            }
          }
        }
        return;
      }catch(err) {
        if(this._isMounted === true){
          this.setState({loading: false, error: true, errs: err.message, errNum:1, errWait:4500});
        }
      }
    }
  }

  getMyConnection = async() => {
    this._isMounted === true
    const { token, totalConnections, totalConnected } = this.props;
    try {
      this.setState({loading:true, error: false, loadingInfo:'...loading', errNum:null, errs:null});
      if(this.state.errWait > 0 ){
        this.setState({error: false});
        setTimeout(async() => {
          await this.props.profileActions.prefillConnections(token, 1);
          if(this._isMounted === true){
            this.setState({loading:false, loadingInfo:null, isOverlayVisible: totalConnections === 0 || totalConnected ===0 ? true: false, errWait:0});
          }
        }, this.state.errWait)
      } else {
        await this.props.profileActions.prefillConnections(token, 1);
        if(this._isMounted === true){
          this.setState({loading:false, loadingInfo:null, isOverlayVisible: totalConnections === 0 || totalConnected ===0 ? true: false, errWait:0})
        }
      }
      return;
    } catch(err) {
      if(this._isMounted === true){
        this.setState({loading:false, error:true, loadingInfo:null, errs:err.message, errNum:2, errWait:2500})
      }
    }
  }

  loadMorePost = async() => {
    let goPage;
    if(this.state.moreloader) {
        setInterval(()=>{
            const nope = 'nope';
        }, 6000)
        return;
    } 
    goPage = await this.props.goPager;
      if(!goPage) {
          goPage = 1;
    }
    if(goPage === this.state.pager){
        return;
    }
    else {
        await this.setState({moreloader:true, loadingInfo: 'loading post...', error:false});
        try {
            if(this.state.errWait > 0 ){
              this.setState({error: false});
              setTimeout(async() => {
                await this.props.postActions.fetchPosts(this.state.pager)
                this.setState({loadingInfo:null, pager: this.state.pager < goPage ? goPage:this.state.pager, errWait:0});
                setInterval(()=>{
                  this.setState({moreloader: false});
                }, 60000);
              }, this.state.errWait)
            } else {
              await this.props.postActions.fetchPosts(this.state.pager)
              await this.setState({loadingInfo:null, pager: this.state.pager < goPage ? goPage:this.state.pager, errWait:0});
              setInterval(()=>{
                this.setState({moreloader: false});
              }, 60000);
            }
            return;
        }catch(err) {
            this.setState({moreloader: false, error: true, errs: err.message, errNum:3, loadingInfo:null, errWait:4500});
        }
    }
  }

  chatNavFunction = async() => {
    if(!this.state.anotherUser.accepted){
      const { bizname, displayName } = this.state.anotherUser;
      return Services.allAlert(Alert,'Connect', `You need to connect with ${!bizname || bizname==='null' ? displayName : bizname} before you can chat`, 'Connect', 'default', this.connectNew, true);
    }
    const { connID, _id, img, bizname, displayName } = this.state.anotherUser;
    const conn = {_id, connID, img, bizname, displayName, user:this.props.rProfile._id}
    await this.props.profileActions.setCurrentChat(conn);
    return this.props.navigation.navigate('ChatText');
  }

  chatLink = async() => {
    try{
      await this.props.profileActions.openChat()
      return this.props.navigation.navigate('Chat');
    } catch(err){
      return Services.allAlert(Alert,'Error', 'Error fetching your chats', 'Try Again', 'destructive', this.chatLink, true);
    }
  }

  shareHeaderPress = async () => {
    const { title, shortdesc } = this.state.optionValue;
    let message = `Hello! \nCheck out my post on LGB App \n${title} \n${shortdesc||null}` 
    try {
    Share.share({ message: message, title:title })
    } catch(err){
        console.log(err);
    }
  };

  deleteUserPost = async () => {
    const { _id } = this.state.optionValue;
    this.setState({loading: true, errs: null, errNum:null, loadingInfo:'deleting post...', submitting: false})
    try {
        if(this.state.errWait > 0 ){
          setTimeout(async() => {
            await this.props.postActions.deleteUserPosts(_id);
            this.setState({loading: false, submitting:true, deleted:true, errWait:0});  
          }, this.state.errWait)
        }else {
          await this.props.postActions.deleteUserPosts(_id);
          this.setState({loading: false, submitting:true, deleted:true, errWait:0});  
        }
        return;
    } catch(err) {
        console.log(err);
        this.setState({loading: false, error: true, errs: err.message, submitting:true, errNum: 6, errWait:4500});
    }
  }

  render() {
    const { img, lname, fname, dob, city, desc } = this.props.rProfile;
    const userNamet = `${fname} ${lname}, ${moment().diff(dob, 'years',false)}`;  
    const userNamettt = this.state.anotherUser? `${this.state.anotherUser.fname} ${this.state.anotherUser.lname}`:null;  
    const userCtry = this.props.userCountry === null || this.props.userCountry === undefined ? null : this.props.userCountry.name
    const uLocation = `${city}, ${userCtry}`;
    const uDesc = this.state.anotherUser ? !this.state.anotherUser.desc ? 'No Comment': this.state.anotherUser.desc : !desc ? `Hi ${fname}, you can describe yourself here...`: desc;
    const totalUserPosts = !this.props.totalUserPost? '0': this.props.totalUserPost;


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
          this.state.loading===true ? 
          <Block center style={{ position:'absolute', bottom: 180, padding:5, borderRadius: 4, ...styles.shadow,
          zIndex:10, width: width*0.6, height: 80, backgroundColor: argonTheme.COLORS.WHITE}}>
            <Spinner color={argonTheme.COLORS.GRADIENT_START} label={this.state.loadingInfo}/>
          </Block>:null
        }
        <ProfileAlert name={fname} on={this.state.isOverlayVisible} press={() => this.setState({ isOverlayVisible: false })}/>
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
                <TouchableOpacity style={{...styles.avatarContainer, zIndex:90000}} onPress={() => this.setState({editPhotoBtn: !this.state.editPhotoBtn})}>
                  <Block middle style={{...styles.avatarContainer, marginTop:0}}>
                    <Image
                      source={{ uri: this.state.anotherUser !==null ? Odb.dbUrl+this.state.anotherUser.img[0] : Odb.dbUrl+img }}
                      style={styles.avatar}
                    />
                    {
                      this.state.editPhotoBtn ?
                      <Block style={{...styles.avatar, position:'absolute', top: 0, zIndex:90, overflow:'hidden'}}>
                        <Block flex={0.7}></Block>
                        <TouchableOpacity style={{backgroundColor:argonTheme.COLORS.GRADIENT_END, flex:0.3}} onPress={this.goFindPhoto}>
                          <Block middle center style={{alignContent:'center', justifyContent:'center'}}>
                            <Text style={{fontFamily:'bold', fontSize:15, color:'white', marginTop: 4}}>Change</Text>
                          </Block>
                        </TouchableOpacity>
                      </Block> : null
                    }
                  </Block>
                </TouchableOpacity>
                <Block style={styles.info}>
                  {
                    !this.state.anotherUser ? 
                    <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                      <Button small style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} onPress={this.chatLink}>
                        CHAT
                      </Button>
                    </Block> : 
                    this.state.anotherUser.accepted && this.state.anotherUser.mutual ?
                    <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                      <Button medium style={{ backgroundColor: argonTheme.COLORS.INFO }} onPress={this.disconnectNew}>
                        DISCONNECT
                      </Button>
                      <Button medium style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} onPress={this.chatNavFunction}>
                        CHAT
                      </Button>
                    </Block>:
                    this.state.anotherUser.accepted ?
                    <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                      <Button medium style={{ backgroundColor: argonTheme.COLORS.INFO }} onPress={this.disconnectNew}>
                        DISCONNECT
                      </Button>
                      <Button medium style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} onPress={this.chatNavFunction}>
                        CHAT
                      </Button>
                    </Block> :
                    <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                      <Button small style={{ backgroundColor: argonTheme.COLORS.INFO }} onPress={this.connectNew}>
                        CONNECT
                      </Button>
                      <Button small style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} 
                        onPress={this.chatNavFunction}>
                        CHAT
                      </Button>
                    </Block>
                  }
                  {/* {
                    !this.state.anotherUser ? 
                      <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                        <Button small style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} onPress={this.chatLink}>
                          CHAT
                        </Button>
                      </Block> :
                      !this.state.anotherUser.mutual ?
                      <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                        <Button small style={{ backgroundColor: argonTheme.COLORS.INFO }} onPress={this.connectNew}>
                          CONNECT
                        </Button>
                        <Button small style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} 
                          onPress={this.chatNavFunction}>
                          CHAT
                        </Button>
                      </Block> :
                      <Block middle row space="evenly" style={{ marginTop: 20, paddingBottom: 24 }}>
                        <Button medium style={{ backgroundColor: argonTheme.COLORS.INFO }} onPress={this.disconnectNew}>
                          DISCONNECT
                        </Button>
                        <Button medium style={{ backgroundColor: argonTheme.COLORS.DEFAULT, ...styles.textFont }} onPress={this.chatNavFunction}>
                          CHAT
                        </Button>
                      </Block>
                  } */}
                  <Block row space="between">
                    <TouchableOpacity onPress={() => this.state.anotherUser ? this.props.navigation.navigate('nowhere'): this.props.navigation.navigate('Post')}>
                    <Block middle>
                      <Text bold size={12} color="#525F7F" style={{ marginBottom: 4, ...styles.textFont }}>
                        {!this.state.anotherUser ? this.manageNumbers(parseInt(totalUserPosts)): this.manageNumbers(parseInt(this.props.friendsPrefill.friendsTotalPost))}
                      </Text>
                      <Text size={12} style={{fontFamily:'bold'}}>Posts</Text>
                    </Block>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.state.anotherUser ? this.props.navigation.navigate('nowhere'):
                        this.props.navigation.navigate('Connections', {routeKey:this.props.navigation.state.routeName})}}>
                    <Block middle>
                      <Text bold color="#525F7F" size={12} style={{ marginBottom: 4, ...styles.textFont }}>
                        {!this.state.anotherUser ? this.manageNumbers(parseInt(this.props.totalConnections)): this.manageNumbers(parseInt(this.props.friendsPrefill.totalConnections))}
                      </Text>
                      <Text size={12} style={{fontFamily:'bold'}}>Followers</Text>
                    </Block>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.state.anotherUser ? this.props.navigation.navigate('nowhere'):
                      this.props.navigation.navigate('Connected', {routeKey:this.props.navigation.state.routeName})}}>
                    <Block middle>
                      <Text bold color="#525F7F" size={12} style={{ marginBottom: 4, ...styles.textFont }}>
                        {!this.state.anotherUser ? this.manageNumbers(parseInt(this.props.totalConnected)):this.manageNumbers(parseInt(this.props.friendsPrefill.totalConnected))}
                      </Text>
                      <Text size={12} style={{fontFamily:'bold'}}>Following</Text>
                    </Block>
                    </TouchableOpacity>
                  </Block>
                </Block>
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                    <Text bold size={26} color="#32325D" style={{fontFamily:'bold'}}>
                      { this.state.anotherUser !== null ? userNamettt : userNamet}
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
                      numberOfLines={2}
                      size={15}
                      color="#525F7F"
                      style={{ textAlign: "center", ...styles.textFont }}
                    >
                      {uDesc}
                    </Text>
                    {
                      this.state.anotherUser ? null : !desc ? 
                    <Button onPress={() =>this.setState({describe:true})} shadowless={true}color="transparent"
                      style={{ marginTop: Platform.OS==='android'?10:0, width:width/2, elevation:0}}
                      textStyle={{color: "#233DD2", fontWeight: "500", fontSize: 16,...styles.textFont
                      }}>Edit Status
                    </Button>
                    :
                    <Button onPress={() =>this.setState({describe:true})} shadowless={true}color="transparent"
                      style={{ marginTop: -7, width:width/2, elevation:0}}
                      textStyle={{color: "#233DD2", fontSize: 11,...styles.textFont }}>Change
                    </Button>
                    }
                  </Block>
                  <Block row style={{ paddingVertical: 14, alignItems: "baseline" }}>
                    <Text bold size={16} color="#525F7F" style={{fontFamily:'bold'}}>
                      {this.state.anotherUser? `${this.state.anotherUser.fname}'s Post` : 'My Post'}
                    </Text>
                  </Block>
                  {
                    this.state.anotherUser ? null :
                      <Block row style={{ paddingBottom: 20, justifyContent: "flex-end" }}>
                        <Button
                          onPress={()=> this.setState({viewsType: !this.state.viewsType})}
                          style={{elevation:0}} shadowless={true} small color="transparent"
                          textStyle={{ color: "#5E72E4", fontSize: 12, ...styles.textFont }}>
                          {this.state.viewsType ? 'View Less' : 'View all'} 
                        </Button>
                      </Block>
                  }
                  
                    {
                      this.state.viewsType ?
                      <Block style={{ paddingBottom: -HeaderHeight * 2, width:(width-(theme.SIZES.BASE*2)), marginLeft: -16}}>
                          <FlatList
                              style={{flex: 1}}
                              horizontal={false}
                              data={!this.state.anotherUser ? this.props.userPost: this.props.friendsPrefill.friendPost}
                              keyExtractor={pp => pp._id}
                              renderItem={({item}) => (
                                  <ColumnGrid imgUrl={item.imageUrl} onSelects={() => this.productSelect(item)}
                                  titleLabel={item.title} userImg={Odb.dbUrl + item.creator.img[0]} 
                                  userName = {item.creator.displayName} coyName={item.creator.bizname} stype={item.stype}
                                  type={!this.state.anotherUser ? 'owner':'user'} headerPress={() => this.headerPress(item)} />
                              )}
                          /> 
                      </Block>: this.state.anotherUser ? null :
                      <Block style={{ paddingBottom: -HeaderHeight * 2}}> 
                        <Block row space="between" style={{ flexWrap: "wrap" }}>
                          {this.props.userPost.map((img, imgIndex) => (
                            <Thumbnails imgUrl={Odb.dbUrl + img.imageUrl[0]} key={img._id} onSelects={() => this.productSelect(img)}/>
                          ))}
                        </Block>
                    </Block>
                  }
                </Block>
              </Block>
              <Block style={{marginBottom: Platform.OS === 'android' ? 
                height < 700 ? '27%' : '23%' : height < 700 ? '23%' : '23%'}}></Block>
            </ScrollView>
            {
              this.state.moreloader===true ? <Block center style={{ position:'absolute', bottom:height<=720?60:80, zIndex:100 }}><Spinner color={argonTheme.COLORS.GRADIENT_START} textColor label={this.state.loadingInfo}/></Block>:null
            }
          </ImageBackground>
        </Block>
        {
          this.state.options ?
          <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
            <Block style={{...styles.floatInside, paddingHorizontal: 0, marginBottom: Platform.OS==='android' ? 50 : 18}}>
              <Block style={{flex:1}}>
                <TouchableCmp shadowless style={{...styles.optionBtn, flex:0.32}} onPress={this.deleteUserPost}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ERROR}}>Delete</Text>
                  </Block>
                </TouchableCmp>
                <TouchableCmp shadowless style={{...styles.optionBtn, flex:0.36}} onPress={this.shareHeaderPress}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Share</Text>
                  </Block>
                </TouchableCmp>
                <TouchableCmp shadowless style={{...styles.optionBtn, flex:0.32}} onPress={this.headerPressCancel}>
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
                  value={this.state.sDescription !== null ? this.state.sDescription.replace(/[^a-z,A-Z,0-9,.,;,-,',",\s]/g,''): ''}
                  onChangeText={text => { this.setState({sDescription: text.replace(/[^a-z,A-Z,0-9,.,;,-,',",\s]/g,'')}) }}
                  autoCompleteType = "name"
                  autoCapitalize = "sentences"
                  multiline={true}
                  numberOfLines = {3}
                  style={{fontSize: 14, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START, height: 50}}
                />
                <Block row style={{alignContent:'flex-end', width:'100%'}}>
                  <Button onPress={this.submitDescription} shadowless={true} small style={{width:width/4, marginTop: 5, marginRight: 10,
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
        {this.state.deleted ?
          <Block shadow={true} shadowColor='black' center style={{...styles.float}} justifyContent='center' alignItems='center'>
                  <Block style={{...styles.floatInside, paddingVertical:0, alignItems: 'center', height: height * 0.56, backgroundColor:'rgba(151,101,195,0.4)', overflow:'hidden'}}>
                      <Block row flex={0.25} style={{width:width-theme.SIZES.BASE,backgroundColor:'white'}}>
                          <Block flex={1.8} style={{justifyContent:'center', alignItems:'center'}}>
                              <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{this.state.deleted ? 'Deleted' : 'Success!!!'}</Text>
                          </Block>
                          <Block flex={0.2} style={{justifyContent:'center', alignItems:'center'}}>
                              <TouchableCmp shadowless onPress={() => this.setState({deleted: false, options:false})}>
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
                        <Block flex={1} center middle style={{justifyContent:'center', alignContent:'center'}}>
                            <Ionicons
                                style={{marginRight: 10}}
                                name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                                size={56}
                                color= {argonTheme.COLORS.WARNING}
                            />
                            <Text fontSize={28} color={argonTheme.COLORS.WARNING} style={{fontFamily:'bold'}}>Post deleted successfully!</Text>
                        </Block>
                      </Block>
                      <Block flex={0.2} style={{width:width-theme.SIZES.BASE,backgroundColor:'white', marginTop:5, justifyContent:'center', alignItems:'center'}}>
                          <Text style={{fontFamily:'regular', fontSize:18, color: argonTheme.COLORS.GRADIENT_START}}>{null}</Text>
                      </Block>
                  </Block>
          </Block>
          :
          null
          }
          {
            this.state.anotherUser ? 
            <Block center row style={{position: 'absolute', bottom: 10, right:5, zIndex:9000}}>
              <TouchableOpacity shadowless={true} onPress={this.returnUser}
                  style={{height:60,width:60,borderRadius:30, backgroundColor:argonTheme.COLORS.GRADIENT_START, alignItems:'center',overflow:"hidden" }}>
                  <Block style={{height:60,width:60,borderRadius:30, alignItems:'center', justifyContent:'center'}}>
                    <AntDesign
                      name='user'
                      size={26}
                      color={argonTheme.COLORS.WHITE}
                      />
                    <Text style={{fontFamily: 'bold', fontSize:8, color:argonTheme.COLORS.WHITE}}>Return</Text>
                  </Block>
              </TouchableOpacity>
          </Block> : null
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
    marginTop:2,
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
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 6
  },
  errBtn:{
    width: theme.SIZES.BASE * 8,
    backgroundColor: Platform .OS==='android' ? argonTheme.COLORS.GRADIENT_START : 'transparent'
  },
});

const mapStateToProps = function(state) {
  return {
    rProfile: state.profile.profile,
    token: state.profile.userToken,
    newConnect: state.profile.newConnect,
    userCountry: state.profile.userCountry,
    userPost: state.posting.availablePosts,
    totalUserPost: state.posting.totalPost,
    goPager: state.posting.userPostPager,
    connectionsPager:state.profile.connectionsPager,
    totalConnected: state.profile.totalConnected,
    totalConnections: state.profile.totalConnections,
    managedProfileState: state.profile.managedProfileState,
    friendsPrefill: state.profile.friendsPrefill,
    socket_newUser: state.dashboard.socket_newUser,
    socket_updateUser: state.dashboard.socket_updateUser,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    postActions: bindActionCreators(postActions, dispatch),
    profileActions: bindActionCreators(profileActions, dispatch),
    dash: bindActionCreators(dash, dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Profile);

