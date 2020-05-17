import React from 'react';
import { StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as cartActions from '../store/actions/cart';
import * as profileActions from '../store/actions/editProfile';
import { Block, Text, theme } from 'galio-framework';
import { argonTheme } from '../constants/';
import { AppSearch, InsideContainer } from '../components';
import { Services } from "../actionable";
import { androidPhone, height, width, iPhoneX, HeaderHeight }  from '../constants/utils'



class Chat extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state={
      text:null,
      fullText: null,
      filter: false,
      searchText:null,
      searchResult:[],
      linkedChat: [],
      linkedOtherInfo:null,  //hold other info regarding linkedChat
      showChat: false,
      loading: false,
      isTyping:null,
    }
    this.navHeaderFunction = this.navHeaderFunction.bind(this);
    this.openChat = this.openChat.bind(this);
    this.openChatMessage = this.openChatMessage.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.checkProfile = this.checkProfile.bind(this);
    this.recievedText = this.recievedText.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    this._isMounted = true;
    this.props.navigation.setParams({ navHeaderFunction: this.navHeaderFunction });
    await this.checkProfile();
    return await this.openChat();
  }
  
  async componentDidUpdate(prevProps) {
    if(this.props.newMessage !== prevProps.newMessage){
      console.log('I saw a new message');
    }
    if(this.props.newText !== prevProps.newText){
      await this.recievedText();
    }
    return;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  checkProfile = async() => {
    if(!this.props.rProfile._id){
      await this.props.profileActions.fetchUser();
      return;
    }
    return;
  }

  recievedText = async() => {
    if(this.props.newText){
      await this.openChat();
      return;
    }
    return;
  }

  openChat = async(x) => {
    const pg = !x ? 1 : x
    try{
      this.setState({loading:true});
      await this.props.profileActions.openChat(pg);
      if(this._isMounted === true){
        // await this.props.cartActions.removeCurrentChat();
        return this.setState({loading:false});
      }
      return;
    }catch(err){
      return Services.allAlert(Alert,'Error', `Error Loading your conversation`, 'Try Again', 'destructive', this.openChat, true);
    }
  }

  searchChatOptions = (x) => {
    let result; 
    if(x){
      result = this.props.chatMessages.filter(el => el.conn.connection.displayName.toLowerCase().includes(x.toLowerCase()));
      if(result){
        return this.setState({searchResult: result.length > 0 ? result: this.state.searchResult});
      }
    }
    if(!x){
      return this.setState({searchResult:[]});
    }
    return;
  }

  openChatMessage = async(x) =>{
    const conn = {...x, user:this.props.rProfile._id}
    await this.props.profileActions.setCurrentChat(conn);
    return this.props.navigation.navigate('ChatText');
  }

  loadMore = () => {
    const pager = this.props.chatPager == 0 ? 1 : this.props.chatPager;
    return this.openChat(pager);
  }

  navHeaderFunction = () => {
    return this.setState({filter: !this.state.filter});
  }

  renderNavigation = () => {
    return (
      <Block flex style={{...styles.group, position:'absolute',...styles.shadow}}>
        <Block style={{ marginBottom: theme.SIZES.BASE }}>
          <AppSearch val={this.state.searchText} cancel={() => this.setState({searchText:null})} placeholder='Search conversations' inner
          change={value => this.setState({searchText:value}, ()=>this.searchChatOptions(value))}/>
        </Block>
      </Block>
    );
  };
  render() {
    return (
      <Block flex style={styles.container}>
        <StatusBar barStyle="light-content" />
        {this.state.filter ? this.renderNavigation(): null}
        <Block flex={1}>
          <Block flex={1} style={{marginTop:Platform.OS==='android'&&60}}>
            <InsideContainer switcher={this.state.filter} chat myList={this.props.chatMessages} myReward={this.openChatMessage} refreshing={this.state.loading} extra={this.props.chatMessages} loadMore={this.loadMore} user={this.props.rProfile._id} search={this.state.searchResult}/>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE,
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  group: {
    borderColor: argonTheme.COLORS.GREY,
    marginTop: Platform.OS==='android' ? HeaderHeight:0,
    width: width,
    height:48,
    zIndex: 11000, 
  },
  search: {
    borderRadius: 0,
    backgroundColor:'rgba(107,36,170,0.1)',
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 6
  },
});
const mapStateToProps = state => {
  return{
    socketConn: state.dashboard.socketConnection,
    allConnected: state.profile.allConnected,
    chatMessages: state.cart.chatMessages,
    currentChat: state.cart.currentChat,
    isTyping: state.cart.isTyping,
    chatMessages: state.cart.chatMessages,
    rProfile: state.profile.profile,
    chatPager: state.cart.chatPager,
    newText: state.cart.newText
  }
}

const mapDispatchToProps = dispatch =>{
  return {
    cartActions: bindActionCreators(cartActions, dispatch),
    profileActions: bindActionCreators(profileActions, dispatch),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Chat);
