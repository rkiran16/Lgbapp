import React from 'react';
import { StyleSheet, Platform, Alert, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GiftedChat } from 'react-native-gifted-chat';
import * as cartActions from '../store/actions/cart';
import * as profileActions from '../store/actions/editProfile';
import { Ionicons } from '@expo/vector-icons';
import { Block, Text, theme } from 'galio-framework';
import { argonTheme } from '../constants/';
import { Services } from "../actionable";
import { HeaderHeight, width }  from '../constants/utils';
import moment from 'moment';



class Chat extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state={
      text:null,
      fullText: null,
      filter: false,
      searchText: null,
      messages: [],
      linkedOtherInfo:null,  //hold other info regarding messages
      showChat: false,
      loading: false,
      isTyping:false
    }
    this.getPreviousMessages = this.getPreviousMessages.bind(this);
    // this.modalCloser = this.modalCloser.bind(this);
    this.setIsTyping = this.setIsTyping.bind(this);
    this.existingMessage = this.existingMessage.bind(this);
    this.messageFocus = this.messageFocus.bind(this);
    this.setHeaderTitle = this.setHeaderTitle.bind(this);
    this.addNewMessage = this.addNewMessage.bind(this);
    this.adjustMessage = this.adjustMessage.bind(this);
  }

  componentWillMount(){
    return this.setHeaderTitle();
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.getPreviousMessages();
    return this.adjustMessage();
  }
  
  async componentDidUpdate(prevProps) {
    this._isMounted = true;
    if(this.props.currentChat !== prevProps.currentChat){
      this.setHeaderTitle();
      await this.getPreviousMessages();
      this.adjustMessage();
    }
    if(this.props.isTyping !== prevProps.isTyping){
      this.setIsTyping();
    }
    if(this.props.existingMessages !== prevProps.existingMessages){
      this.existingMessage();
    }
    if(this.props.newMessage !== prevProps.newMessage){
      this.addNewMessage();
    }
    if(this.props.newText !== prevProps.newText){
      this.addNewMessage();
    }
    return;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  adjustMessage = async() =>{
    await this.props.cartActions.adjustMessageStatus(this.props.currentChat.connID);
    return await this.openChat();
  }

  openChat = async(x) => {
    const pg = !x ? 1 : x
    try{
      await this.props.profileActions.openChat(pg);
      return;
    }catch(err){
      return Services.allAlert(Alert,'Error', `Error Loading your conversation`, 'Try Again', 'destructive', this.openChat, true);
    }
  }

  setHeaderTitle = () => {
    const { displayName, bizname } = this.props.currentChat;
    const name = !bizname || bizname === 'null' ? displayName : bizname;
    return this.props.navigation.setParams({headerTitle: name});
  }

  existingMessage = () => {
    if(!this.props.existingMessages || this.props.existingMessages.length <=0){
      return;
    }
    if(this._isMounted === true){
      return this.setState({messages:this.props.existingMessages})
    }
  }

  addNewMessage = () => {
    if(!this.props.newMessage || this.props.newMessage===null){
      if(this.props.newText){
        return Services.allAlert(Alert,'New Message',`${this.props.newText}`, 'Chat', 'default', null, false);
      }
      return;
    }
    if(this._isMounted === true){
      return this.setState({messages:[...this.state.messages,this.props.newMessage]}, () => {
        this.props.cartActions.removeNewMessage()
        this.props.cartActions.adjustMessageStatus(this.props.newTextConnID);
      });
    }
  }

  setIsTyping = () => {
    if(this._isMounted === true){
      if(this.props.currentChat._id === this.props.isTyping){
          this.setState({isTyping:true})
          setTimeout(()=>{
            this.props.cartActions.setIsTyping();
            this.setState({isTyping:false})
          }, 6000);
      }
    }
    return;
  }

  footer = () => {
    const { displayName, bizname } = this.props.currentChat;
    const name = !bizname || bizname === 'null' ? displayName : bizname;
    if(this.state.isTyping){
      return <Text>{`...${name} is typing`}</Text>
    }
    return <Block />
  }

  sendMessage = async(messages) => {
    if(!this.props.currentChat){
      return;
    }
    try{
      await this.props.cartActions.sendMessage(this.props.currentChat.connID, messages,this.props.currentChat._id)
      return this.setState({messages:[...this.state.messages,messages]})
    }catch(err){
      return Services.allAlert(Alert,'Error', `${err.message}`, 'Try Again', 'destructive', this.getPreviousMessages, true);
    }
  }

  messageFocus = () => {
    try{
       return this.props.cartActions.isTyping(this.props.currentChat._id);
    }catch(err){
        return;
    }
  }

  getPreviousMessages = async() => {
    if(!this.props.currentChat){
      return;
    }else{
      try{
        await this.props.cartActions.checkExistingMssg(this.props.currentChat.connID,this.props.currentChat._id);
        return; 
      }catch(err){
        return Services.allAlert(Alert,'Error', `${err.message}`, 'Try Again', 'destructive', this.getPreviousMessages, true);
      }
    };
  }
  
  // modalCloser = async() =>{
  //   this.setState({showChat:false, messages:null, loading:true})
  //   return await this.openChat();
  // }

  render() {
    const { displayName, bizname } = this.props.currentChat;
    const name = !bizname || bizname === 'null' ? displayName : bizname;
    const status = this.props.isOnline === 'Offline' ? 'Offline': this.props.isOnline === 'Online'? 'Online':`Last seen ${moment(this.props.isOnline).format('LLLL')}`;
    return (
      <Block flex style={styles.container}>
        <Block flex={1}>
              <Block style={{marginTop:Platform.OS==='ios'?32:38, borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999'}}>
                <Block style={{marginTop:Platform.OS==='ios'?32:38, marginLeft: Platform.OS==='ios'?52:55}}>
                    <Block style={{justifyContent:'center', alignItems:'flex-start'}}>
                        <Text style={{fontFamily:'bold', fontSize: 11, color:argonTheme.COLORS.SUCCESS}}>{this.state.isTyping?'typing...': status}</Text>
                    </Block>
                </Block>
              </Block>
              <Block flex={1} style={{width:width}}>
                <GiftedChat
                    messages={this.state.messages}
                    placeholder={`Start messaging ${name}...`}
                    textInputProps={{onFocus:this.messageFocus}}
                    showAvatarForEveryMessage={false}
                    scrollToBottom={true}
                    inverted={false}
                    renderFooter={this.footer}
                    onSend={ messages => this.sendMessage(messages[0])}
                    user={{
                    _id: this.props.currentChat.user,
                    }}
                />
                {
                    Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={70} />
                }
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

});
const mapStateToProps = state => {
  return{
    currentChat: state.cart.currentChat,
    socketConn: state.dashboard.socketConnection,
    chatMessages: state.cart.chatMessages,
    isTyping: state.cart.isTyping,
    isOnline: state.cart.isOnline,
    existingMessages: state.cart.existingMessages,
    newMessage: state.cart.newMessage,
    newText: state.cart.newText,
    newTextConnID: state.cart.newTextConnID,
  }
}

const mapDispatchToProps = dispatch =>{
  return {
    cartActions: bindActionCreators(cartActions, dispatch),
    profileActions: bindActionCreators(profileActions, dispatch),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Chat);
