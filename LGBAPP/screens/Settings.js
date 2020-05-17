import React from "react";
import { StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, StatusBar, FlatList, ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListItem, Badge, Avatar, Button as Btn } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'
import { Ionicons, Entypo, Foundation, MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as dash from '../store/actions/dashboard';
import * as profileActions from '../store/actions/editProfile';
import { Button, Block, theme, Text } from 'galio-framework';
import { Ldb, Services, } from "../actionable";
import {  Icon, Spinner, Selector, InputText, ProfileHeader, AvatarTabs } from '../components';
import { Images, argonTheme } from "../constants";

import { androidPhone, height, width, iPhoneX, HeaderHeight }  from '../constants/utils'

const option = [
  {title: 'Edit Profile', iconName: 'user', iconFamily: 'AntDesign'},
  {title: 'Invite Friends', iconName: 'addusergroup', iconFamily: 'AntDesign'},
  {title: 'Notifications', iconName: 'notification', iconFamily: 'AntDesign'},
  {title: 'Privacy', iconName: 'lock', iconFamily: 'AntDesign'},
  {title: 'Payment', iconName: 'account-balance-wallet', iconFamily: 'MaterialIcons'},
  {title: 'About', iconName: 'infocirlceo', iconFamily: 'AntDesign'},
]

let currType = [
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD', // eslint-disable-line comma-spacing
  'BDT','BGN','BIF','BMD','BND','BOB','BRL','BSD','BWP','BZD','CAD','CDF', // eslint-disable-line comma-spacing
  'CHF','CLP','CNY','COP','CRC','CVE','CZK','DJF','DKK','DOP','DZD','EGP', // eslint-disable-line comma-spacing
  'ETB','EUR','FJD','FKP','GBP','GEL','GIP','GMD','GNF','GTQ','GYD','HKD', // eslint-disable-line comma-spacing
  'HNL','HRK','HTG','HUF','IDR','ILS','INR','ISK','JMD','JPY','KES','KGS', // eslint-disable-line comma-spacing
  'KHR','KMF','KRW','KYD','KZT','LAK','LBP','LKR','LRD','LSL','MAD','MDL', // eslint-disable-line comma-spacing
  'MGA','MKD','MMK','MNT','MOP','MRO','MUR','MVR','MWK','MXN','MYR','MZN', // eslint-disable-line comma-spacing
  'NAD','NGN','NIO','NOK','NPR','NZD','PAB','PEN','PGK','PHP','PKR','PLN', // eslint-disable-line comma-spacing
  'PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SEK','SGD','SHP', // eslint-disable-line comma-spacing
  'SLL','SOS','SRD','STD','SVC','SZL','THB','TJS','TOP','TRY','TTD','TWD', // eslint-disable-line comma-spacing
  'TZS','UAH','UGX','USD','UYU','UZS','VND','VUV','WST','XAF','XCD','XOF', // eslint-disable-line comma-spacing
  'XPF','YER','ZAR','ZMW',
]
currType = currType.map(el => ({label:el, value:el.toLowerCase() }));


class Settings extends React.Component {
  _isMounted = false;
  _userDetails = null;
  state={
    loading: false,
    err:null,
    errNum: null,
    overlayer:false,
    openedTab:null,
    approved:null,
    notify:false,
    billingBtn: 'Edit Billing Address',
    removedNotifications: [],
    showContacts: [],
    contactDenied: false,
    showAvatar:false,
    editCard:false,
    editBilling:false,
    stateData:null,
    form: {
      firstName: '',
      lastName: '',
      sex:null,
      dob:null,
      phonenumber:'',
      address:'',
      city:'',
      statey:'',
      zip:'',
      country:'',
      bizname:'',
      displayName:'',
      img:'',
    },
    card:{
      type:'',
      number:'',
      expiryM:'XX',
      expiryY:'XXXX',
      cvv:'XXX',
      currencytype:''
    },
    billing:{
      address:'',
      city:'',
      state:'',
      zip:''
    }
  }
  async componentWillMount(){
    this._isMounted = true;
    if (this._isMounted) {
      this.props.navigation.setParams({ 
        navHeaderFunction: this.navHeaderFunction,
      })
    }
    await this.getProfile();
    await this.getLNotification();
    return this.photoExist();
  }

  async componentDidUpdate(prevProps) {
    if(this.props.grabbedNotification.data !== prevProps.grabbedNotification.data){
      await this.grabNotification();
    }
    return;
  }

  navHeaderFunction = ()=> {
    return this.props.navigation.navigate('Orders')
  }

  finalSubmit = async() => {
    if (this._isMounted) {
      const { photos } = this.props;
      const { form } = this.state;
      const prev = !photos || !photos.data ? this._userDetails : photos.data;
      try{
        this.setState({loading:true, error:false, errNum:null})
        await Services.finalSubmission(prev, form);
        Alert.alert('Success', 'Please confirm your account to finish up', [
          {
            text: 'Login',
            style: 'default',
            onPress: async() => {
              return this.checkLogged();
            }
          }
          ], {cancelable: false});
        return this.setState({loading:false})
      }catch(err){
        return this.setState({loading:false, error:true, errNum:6})
      }
    }
  }

  photoExist = async() =>{
    const { photos } = this.props
    if(photos.photo.length > 0){
      if(photos.photo.length > 1){
        const prevData = photos.others;
        Alert.alert('Photo Error', 'Multiple photos are not allowed!', [
          {
            text: 'Try Again',
            style: 'destructive',
            onPress: async() => {
              return await this.wrongPhotoUpload(prevData);
            }
          }
          ], {cancelable: false});
        return;
      }
      await this.grabCountryList();
      this.setState({...this.state.form.img=photos.photo, overlayer:true, openedTab:'Edit Profile'})
    }
  }

  wrongPhotoUpload = async(x) =>{
    await this.props.dash.getAllImageSubmit(null, null);
    return this.editAvartar(x);
  }

  componentWillUnmount(){
    this._isMounted=false;
  }

  checkLogged = async() => {
    await Ldb.removeData('user');
    this.props.navigation.navigate('Account');
  }

  getProfile = async() =>{
    const userDetails = await Services.profileInformation();
    const payment = await Services.getPaymentData();
    if(userDetails){
      this._userDetails = userDetails;
      this.setState({form:userDetails});
    }
    if(payment){
      const { cardDetails, billing } = payment;
      this.setState({card:!cardDetails? this.state.card:payment.cardDetails, billing:!billing ? this.state.billing:billing})
    }
  }

  showMyAvatar = () => {
    return this.setState({showAvatar: !this.state.showAvatar, overlayer:!this.state.overlayer})
  }

  showEditCardDetails = () => {
    return this.setState({editCard: !this.state.editCard, overlayer:!this.state.overlayer})
  }

  showBillingEdit = () => {
    return this.setState({editBilling: !this.state.editBilling, overlayer:!this.state.overlayer})
  }

  cardNumber = (x) => {
    let result = 'XXXX';
    if(x){
      result = x.trim().substring(12);
    }
    return result;
  }

  billingEditSubmit = async() => {
    try{
      this.setState({error:null, loading:true})
      const result = await Services.setPaymentData(this.state.billing,null);
      this.setState({loading:false});
      if(result === 'Missing Data'){
        this.allAlert('Error', 'Missing Details. Check your entry', 'Try Again', 'destructive',null);
        return
      }
      return this.allAlert('Status', 'Billing address updated successfully!', 'Return', 'default', this.getProfile());
    }catch(err){
      return this.setState({error:true, err, errNum:99})
    }
  }

  submitCardEdit = async() => {
    try{
      this.setState({error:null, loading:true})
      const result = await Services.setPaymentData(null, this.state.card);
      this.setState({loading:false});
      if(result === 'Missing Data'){
        this.allAlert('Error', 'Missing Details', 'Try Again', 'destructive',null);
        return
      }
      return this.allAlert('Status', 'Card details submitted successfully!', 'Return', 'default', this.getProfile());
      
    }catch(err){
      return this.setState({error:true, err, errNum:98})
    }
  }

  allAlert = async(u, v, w, x, y) => (
    Alert.alert(u, v, [
      {
        text: w,
        style: x,
        onPress: async() => {
          return y;
        }
      }
      ], {cancelable: false})
  );

  removeCardDetails = async() => {
    try{
      this.setState({error:null})
      Alert.alert('Confirm', 'Are you sure?', [
        {
          text: 'Continue',
          style: 'default',
          onPress: async() => {
            await Services.deletePaymentData()
            return await this.getProfile();
          }
        },
        {
          text: 'Cancel',
          onPress: () => {return},
          style: 'destructive',
        },
        ], {cancelable: false});
    }catch(err){
      return this.setState({error:true, err, errNum:98})
    }
  }

  editAvartar = (xix) => {
    return this.props.navigation.navigate('Upload', 
    {incomingRoute: this.props.navigation.state.routeName, carriedData: !xix ? this.state.form : xix})
  }

  grabCountryList = async() => {
    const { country } = this.props;
    if(country.length <=0){
      try{
        this.setState({loading:true, err:null, errNum:null})
        await this.props.profileActions.fetchCountry();
        this.setState({loading:false})
      }catch(err){
        this.setState({err, loading:false, errNum:5})
      }
    }
  }

  inviteMyFriends = async(x) => {
    this._isMounted=true;
    if (this._isMounted) {
      try{
        this.setState({loading:true, err:null, errNum:null})
        await this.props.dash.inviteMyFriend(x);
        this.setState({loading:false});
        alert(`${x.name} will recieve your invite shortly`);
        return;
      } catch(err){
        return this.setState({err, loading:false, errNum:4})
      }
    }
    return
  }

  enableContactPermission = async () => {
    this._isMounted=true;
    if (this._isMounted) {
      const result = await Services.grantContact();
      if(result){
        this.setState({contactDenied:false});
        await this.connectFriends();
      }
    }
    return;
  }

  connectFriends = async() => {
    this._isMounted=true;
    if (this._isMounted) {
      const { status } = await Permissions.getAsync(
        Permissions.CONTACTS
      );
      if (status !== 'granted') {
        const result = await Services.grantContact();
        if(!result){
          this.setState({contactDenied:true}, () =>{
            alert('Hey! You have not enabled contact permissions');
          })
        }
      }else {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Birthday],
          fields: [Contacts.Fields.Emails],
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          this.setState({showContacts:data}, async() => {
            try {
              const result = await Services.contactChecks(data);
              if(result){
                await this.props.dash.compareContact(result);
              }
            }catch(err){
              this.setState({err, errNum: 3})
            }
            // console.log(data[0]);
          })
        }
      }
    }
    return;
  }

  getLNotification = async() => {
    const notifications = await Services.checkNotification();
    if(!notifications) {
      return;
    }
    return this.setState({notify:true});
  }

  enableNotification = async() => {
    try {
      return await Services.pushToken();
    } catch(err) {
      console.log(err)
    }
  }

  grabNotification = async() => {
    this._isMounted=true;
    if (this._isMounted) {
      try{
        this.setState({err:null, errNum:null, loading:true})
        await this.props.dash.getNotifications();
        this.setState({loading:false});
      }catch(err) {
        this.setState({err, errNum:1, loading:false})
      }
    }
  }

  removeFromNotificationList = async(x) =>{
    const { data } = this.props.grabbedNotification;
    const { removedNotifications } = this.state;
    this._isMounted=true;
    if (this._isMounted) {
      try{
        this.setState({err:null, errNum:null, loading:true})
        await this.props.dash.removeNotifications(x._id);
        if(data.length === removedNotifications.length-1){
          await Ldb.removeDataAsync('notifications');
        }
        this.setState({loading:false, removedNotifications:[...this.state.removedNotifications, x._id]});
      }catch(err) {
        this.setState({err, errNum:2, loading:false})
      }
    }
  }

  selection = async(option) => {
    this._isMounted = true;
    if (this._isMounted) {
      let approved;
      if(option === 'Notifications') {
        await this.grabNotification();
        approved = await Ldb.fetchDataAsync('pushtoken');
      }
      if(option === 'Invite Friends') {
        await this.connectFriends();
      }
      if(option === 'Edit Profile') {
        await this.grabCountryList();
      }
      return this.setState({overlayer:true, openedTab:option, approved});
    }
    return;
  }

  closeOverlayer = () => {
    return this.setState({overlayer:false});
  }
  renderNotificationItems = ({item}) => {
    const { removedNotifications } = this.state;
    const tabIndexes = removedNotifications.find(el => el === item._id);
    return (
      <ListItem
        onPress={() =>this.removeFromNotificationList(item)}
        title={item.title || null}
        titleStyle={{fontFamily:'bold', fontSize:16, color:argonTheme.COLORS.GRADIENT_END}}
        subtitle={item.bodyText || 'Enjoy new deals...'}
        subtitleStyle={{fontFamily:'regular', fontSize:15, color:argonTheme.COLORS.BLACKS}}
        leftElement={tabIndexes ? null : <Badge status="error" />}
        bottomDivider
      />
    )
  };

  renderContactListing = ({item}) => {
    let arr;
    const { name, phoneNumbers } = item;
    const { compareContacts } = this.props;
    let namet = name;
    let dName = name;
    namet = namet.split('');
    namet = `${namet[0].toUpperCase()}${namet[1].toUpperCase()}`
    compareContacts.length <=0 ? null : arr = compareContacts.filter(x => phoneNumbers.some(y => (y.number.replace(/[^0-9]/g,'') === x.phonenum)));
    return(
      <ListItem
        title={dName || null}
        titleStyle={{fontFamily:'bold', fontSize:16, color:argonTheme.COLORS.GRADIENT_START}}
        subtitle={!arr || arr.length <=0 ? null : arr[0].displayName}
        subtitleStyle={{fontFamily:'regular', fontSize:15, color:argonTheme.COLORS.BLACKS}}
        leftElement={<Avatar rounded title={namet} overlayContainerStyle={{backgroundColor:argonTheme.COLORS.GRADIENT_END}} 
        titleStyle={{color:'#FFFFFF',zIndex:1000,fontFamily:'bold', fontSize:16}} />}
        bottomDivider
        rightElement={ !arr || arr.length <=0 ?
          <TouchableOpacity onPress={() => this.inviteMyFriends(item)}>
            <Block style={{padding: 5}}><Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.LABEL}}>INVITE</Text></Block>
          </TouchableOpacity> : null
        }
      />
    );
  };

  emptyList = () => (
    <Block style={{justifyContent:'center', alignItems:'center'}}>
      <Text style={{fontFamily:'regular', color:argonTheme.COLORS.GRADIENT_END}}>No Item found</Text>
    </Block>
  );

  avatarTab = () => {
    return(
      <AvatarTabs img={this.state.form.img} press={this.showMyAvatar}/>
    )
  }

  updatePaymentTab = () => {
    const cardList = [{label:'MASTERCARD', value:'MASTERCARD'}, {label:'VISA', value:'VISA'}, {label:'AMERICAN EXPRESS', value:'AMERICAN EXPRESS'}, {label:'DISCOVER', value:'DISCOVER'}, {label:'JCB', value:'JCB'}, {label:'Diners Club', value:'Diners Club'},]
    return(
      <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={Platform.OS==='ios'? HeaderHeight*2:HeaderHeight*1.6}>
      <Block flex={1} style={{paddingHorizontal:20}}>
        <Block style={{marginTop:30}}>
          <TouchableOpacity onPress={this.showEditCardDetails} style={{alignItems:'flex-start', paddingHorizontal:15}}>
              <Block row space='between'>
                  <Ionicons
                      style={{marginRight: 10}}
                      name={Platform.OS === 'android' ? 'md-arrow-back' : 'ios-arrow-back'}
                      size={30}
                      color='#999999'
                  />
                  <Block style={{justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'bold', fontSize: 18, color:'#999999'}}>Back</Text>
                  </Block>
              </Block>
          </TouchableOpacity>
        </Block>
        <Block style={{marginTop: 20, marginBottom:20}}>
          <ProfileHeader fN={this.state.form.firstName} lN={this.state.form.lastName} dN={this.state.form.displayName} img={this.state.form.img}/>
        </Block>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>Edit Payment Card </Text>
        </Block>
        <Block row style={{marginBottom:20, borderColor:argonTheme.COLORS.PLACEHOLDER, borderBottomWidth:StyleSheet.hairlineWidth,marginTop: 26, width:'100%'}}>
          <Block flex={0.30}>
            <Text style={{fontFamily:'regular', fontSize:21, color:argonTheme.COLORS.PLACEHOLDER}}>Currency:</Text>
          </Block>
          <Block flex={0.7}>
            <Selector onChange={val => this.setState({...this.state.card.currencytype=val})} 
            listing={currType||[]} nn='SELECT CURRENCY ' val={this.state.card.currencytype}/>
          </Block>
        </Block>
        <Block row style={{marginBottom:12, borderColor:argonTheme.COLORS.PLACEHOLDER, borderBottomWidth:StyleSheet.hairlineWidth,marginTop: 10, width:'100%'}}>
          <Block flex={0.30}>
            <Text style={{fontFamily:'regular', fontSize:21, color:argonTheme.COLORS.PLACEHOLDER}}>Card Type:</Text>
          </Block>
          <Block flex={0.7}>
            <Selector onChange={val => this.setState({...this.state.card.type=val})} 
            listing={cardList||[]} nn='Select Card Type' val={this.state.card.type}/>
          </Block>
        </Block>
        <Block style={{marginTop: 12, marginBottom:10}}>
          <InputText onChange={text => { this.setState({...this.state.card.number =text})}} tb label={argonTheme.COLORS.PLACEHOLDER}
          ac= "cc-number" acP= "none" rT="next" lb='Card Number:' val={this.state.card.number}/>
        </Block>
        <Block row space='evenly' style={{marginTop: 10, marginBottom:10}}>
          <Block style={{justifyContent:'flex-end', flex: 0.4}}>
            <Text style={{fontFamily:'regular', fontSize:18, color:argonTheme.COLORS.PLACEHOLDER}}>Expiry Date:</Text>
          </Block>
          <Block style={{flex:0.28}}>
            <InputText onChange={text => { this.setState({...this.state.card.expiryM =text})}} tb label={argonTheme.COLORS.PLACEHOLDER}
            ac= "name" acP= "words" rT="next" lb={` MM`} val={this.state.card.expiryM}/>
          </Block>
          <Block style={{justifyContent:'flex-end', flex:0.04}}>
            <Text style={{fontFamily:'regular', fontSize:24, color:argonTheme.COLORS.PLACEHOLDER}}>/</Text>
          </Block>
          <Block style={{flex:0.28}}>
            <InputText onChange={text => { this.setState({...this.state.card.expiryY =text})}} tb label={argonTheme.COLORS.PLACEHOLDER}
            ac= "name" acP= "words" rT="next" lb={` YYYY`} val={this.state.card.expiryY}/>
          </Block>
        </Block>
        <Block style={{marginTop: 12, marginBottom:10}}>
          <InputText onChange={text => { this.setState({...this.state.card.cvv =text})}} tb label={argonTheme.COLORS.PLACEHOLDER}
          ac= "cc-number" acP= "none" rT="next" lb='CVV Number:' val={`${this.state.card.cvv}`}/>
          <Block style={{position:'absolute', right:0, width:22, padding:2, bottom:0}}>
            <Foundation name='credit-card' style={{fontSize:24, color:'black'}} />
          </Block>
        </Block>
        <Block style={{marginBottom:15,marginTop:20 }}>
          <Btn
            title="Edit Card"
            titleStyle = {{fontFamily:'bold', fontSize: 20}}
            type="outline"
            raised
            onPress={this.submitCardEdit}
            loading={this.state.loading}
            loadingProps={<ActivityIndicator size="small" color={argonTheme.COLORS.BLUE} />}
            icon={
              <MaterialIcons
                name='verified-user'
                size={28}
                color='#0c8ad7'
                style={{marginRight:15}}
              />
            }
          />
        </Block> 
      </Block>
      </KeyboardAvoidingView>
    );
  }

  updateBillingAddress = () => {
    return(
      <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={Platform.OS==='ios'? HeaderHeight*2:HeaderHeight*1.6}>
      <Block flex={1} style={{paddingHorizontal:20}}>
        <Block style={{marginTop:30}}>
          <TouchableOpacity onPress={this.showBillingEdit} style={{alignItems:'flex-start', paddingHorizontal:15}}>
              <Block row space='between'>
                  <Ionicons
                      style={{marginRight: 10}}
                      name={Platform.OS === 'android' ? 'md-arrow-back' : 'ios-arrow-back'}
                      size={30}
                      color='#999999'
                  />
                  <Block style={{justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'bold', fontSize: 18, color:'#999999'}}>Back</Text>
                  </Block>
              </Block>
          </TouchableOpacity>
        </Block>
        <Block style={{marginTop: 20, marginBottom:20}}>
          <ProfileHeader fN={this.state.form.firstName} lN={this.state.form.lastName} dN={this.state.form.displayName} img={this.state.form.img}/>
        </Block>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>Edit Billing Address </Text>
        </Block>
        <Block style={{marginTop: 26, marginBottom:20}}>
          <InputText onChange={text => { this.setState({...this.state.billing.address =text, billingBtn:'Submit'})}} tb label={argonTheme.COLORS.PLACEHOLDER}
          ac= "street-address" acP= "words" rT="next" lb='Address:' val={this.state.billing.address}/>
        </Block>
        <Block style={{marginTop: 12, marginBottom:10}}>
          <InputText onChange={text => { this.setState({...this.state.billing.city =text, billingBtn:'Submit'})}} tb label={argonTheme.COLORS.PLACEHOLDER}
          ac= "cc-number" acP= "none" rT="next" lb='City:' val={this.state.billing.city}/>
        </Block>
        <Block style={{marginTop: 12, marginBottom:10}}>
          <InputText onChange={text => { this.setState({...this.state.billing.state =text, billingBtn:'Submit'})}} tb label={argonTheme.COLORS.PLACEHOLDER}
          ac= "cc-number" acP= "none" rT="next" lb='State:' val={this.state.billing.state}/>
        </Block>
        <Block style={{marginTop: 12, marginBottom:10}}>
          <InputText onChange={text => { this.setState({...this.state.billing.zip =text, billingBtn:'Submit'})}} tb label={argonTheme.COLORS.PLACEHOLDER}
          ac= "cc-number" acP= "none" rT="next" lb='Zip Code:' val={this.state.billing.zip}/>
        </Block>
        <Block style={{marginBottom:15,marginTop:20 }}>
          <Btn
            title={this.state.billingBtn}
            titleStyle = {{fontFamily:'bold', fontSize: 20}}
            type="outline" raised
            onPress={this.billingEditSubmit}
            loading={this.state.loading}
            loadingProps={<ActivityIndicator size="small" color={argonTheme.COLORS.ACTIVE} />}
            icon={
              <MaterialIcons
                name='verified-user'
                size={28}
                color={argonTheme.COLORS.ACTIVE}
                style={{marginRight:15}}
              />
            }
          />
        </Block> 
      </Block>
      </KeyboardAvoidingView>
    );
  }


  inviteFriends = () => {
    return(
      <Block flex={1} style={{paddingHorizontal:15}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>Invite Friends</Text>
        </Block>
        <Block flex={1} style={{marginTop:6}}>
          {
            !this.state.contactDenied ? null :
              <Block style={{...styles.shadow, paddingVertical: 10, backgroundColor:'black', alignItems:'center', justifyContent:'center'}}>
                <Block row style={{alignItems:'center', justifyContent:'center'}}>
                  <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.WHITE}}>Contact Permissions Denied.</Text>
                  <TouchableOpacity onPress={this.enableContactPermission}>
                    <Block style={{}}>
                      <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.LABEL}}>  Enable here!</Text>
                    </Block>
                  </TouchableOpacity>
                </Block>
                <Block>
                  <Text style={{fontFamily:'regular', fontSize:12, color:argonTheme.COLORS.WHITE, marginTop:4}}>Or go to your phone settings to enable</Text>
                </Block>
              </Block>
          }
          <Block flex={1} style={{marginTop:this.state.contactDenied ? 5: 1}}>
            <FlatList
              style={{flex: 1}}
              alwaysBounceVertical={true}
              showsVerticalScrollIndicator={false}
              data={this.state.showContacts}
              keyExtractor={pp => pp.id}
              ListEmptyComponent={this.emptyList}
              renderItem={this.renderContactListing}
            />
          </Block>
        </Block>
      </Block>
    );
  }
  editProfile = () => {
    let showCList = [{label: 'Female', value: 'Female' }, {label: 'Male', value: 'Male' }];
    return(
      <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={Platform.OS==='ios'? HeaderHeight*2:HeaderHeight*1.6}>
      <Block flex={1} style={{paddingHorizontal:15}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>My Profile</Text>
        </Block>
        <Block flex={1} style={{width:'100%'}}>
          <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
          <ProfileHeader button fN={this.state.form.firstName} lN={this.state.form.lastName} dN={this.state.form.displayName} img={this.state.form.img} press={this.showMyAvatar} ePress={() =>this.editAvartar()}/>
          <Block style={{marginTop: 25}}>
            <Block>
              <Block style={{ marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.firstName=text.replace(/[^a-z,A-Z,\s]/g,'')})}} 
                ac= "name" acP= "words" rT="next" lb='First Name' val={this.state.form.firstName}/>
              </Block> 
              <Block style={{marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.lastName=text.replace(/[^a-z,A-Z,\s]/g,'')})}} 
                ac= "name" acP= "words" rT="next" lb='Last Name' val={this.state.form.lastName}/>
              </Block> 
              <Block row style={{marginBottom:11, borderColor:argonTheme.COLORS.PLACEHOLDER, borderBottomWidth:StyleSheet.hairlineWidth, marginTop:15, width:'100%'}}>
                <Block flex={0.15}>
                  <Text style={{fontFamily:'regular', fontSize:21, color:argonTheme.COLORS.BLACKS}}>Sex:</Text>
                </Block>
                <Block flex={0.85}>
                  <Selector onChange={val => this.setState({...this.state.form.sex=val})} 
                  listing={showCList||[]} nn='I choose not to Identify' val={this.state.form.sex}/>
                </Block>
              </Block>
              <Block style={{marginBottom:12, marginTop:15, width:'100%'}}>
                <DatePicker
                  style={{width: '100%', marginTop:18, borderColor:'white'}}
                  customStyles={{
                    placeholderText: {fontSize: 25, color:argonTheme.COLORS.BLACKS, fontFamily:'regular'},
                    dateText: {borderWidth:0,fontSize: 25, color:argonTheme.COLORS.BLACKS, fontFamily:'regular'}
                  }}
                  date={this.state.form.dob}
                  mode="date"
                  androidMode="spinner"
                  placeholder={this.state.form.dob}
                  format="YYYY-MM-DD"
                  minDate="1940-01-01"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  iconSource={Images.Datepng}
                  //selected={date => setDob(date)}
                  onDateChange={date => this.setState({...this.state.form.dob=Services.checkDateOfBirth(date)})}
                />
                <Block style={{position:'absolute', top:Platform.OS==='android'? -7.5:-6, left:1, backgroundColor:'white',width:width*0.4, padding:5}}>
                <Text style={{fontFamily:'regular', fontSize:21, color:'#999999'}}>Date of Birth:</Text>
                </Block>
              </Block>
              <Block style={{marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.bizname=text})}} 
                ac= "name" acP= "words" rT="next" lb='Business Name' val={this.state.form.bizname}/>
              </Block>  
              <Block style={{marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.phonenumber=text.replace(/[^0-9,\s]/g,'')})}} 
                ac= "tel" acP= "none" rT="next" lb='Phone Number' val={this.state.form.phonenumber}/>
              </Block>
              <Block style={{marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.address=text})}} 
                ac= "street-address" acP= "none" rT="next" val={this.state.form.address} lb='Address'/>
              </Block>  
              <Block style={{marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.city=text})}} 
                ac= "off" acP= "none" rT="next" lb='City' val={this.state.form.city}/>
              </Block>  
              <Block row style={{marginBottom:12, borderColor:argonTheme.COLORS.PLACEHOLDER, borderBottomWidth:StyleSheet.hairlineWidth, marginTop:15, width:'100%'}}>
                <Block flex={0.2}>
                  <Text style={{fontFamily:'regular', fontSize:21, color:'#999999'}}>State:</Text>
                </Block>
                <Block flex={0.8}>
                  <Selector onChange={value => this.setState({...this.state.form.statey=value})} listing={Services.grabStateData(this.props.country, this.state.form.country)} 
                  nn='Select State' val={this.state.form.statey}/>
                </Block>
              </Block>
              <Block style={{marginBottom:12 }}>
                <InputText onChange={text => { this.setState({...this.state.form.zip=text})}} 
                ac= "postal-code" acP= "none" rT="next" lb='Zip Code' val={this.state.form.zip}/>
              </Block> 
              <Block row style={{marginBottom:18, borderColor:argonTheme.COLORS.PLACEHOLDER, borderBottomWidth:StyleSheet.hairlineWidth, marginTop:15, width:'100%'}}>
                <Block flex={0.35}>
                  <Text style={{fontFamily:'regular', fontSize:21, color:'#999999'}}>Country:</Text>
                </Block>
                <Block flex={0.77}>
                  <Selector onChange={value => this.setState({...this.state.form.country=value})} listing={this.props.country} 
                  nn='Select Country' val={this.state.form.country}/>
                </Block>
              </Block> 
              <Block style={{marginBottom:15 }}>
                <Btn
                  title="Submit"
                  titleStyle = {{fontFamily:'bold', fontSize: 20}}
                  type="outline"
                  raised
                  onPress={this.finalSubmit}
                  loading={this.state.loading}
                  loadingProps={<ActivityIndicator size="small" color={argonTheme.COLORS.ACTIVE} />}
                  icon={
                    <Entypo
                      name='user'
                      size={28}
                      color={argonTheme.COLORS.ACTIVE}
                      style={{marginRight:15}}
                    />
                  }
                />
              </Block> 
            </Block>
          </Block>
        </ScrollView>
        </Block>
      </Block>
      </KeyboardAvoidingView>
    );
  }
  notification = () => {
    return(
      <Block flex={1} style={{paddingHorizontal:15}}>
        <Block row style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999', marginRight:3}}>My Notifications</Text>
          {
            !this.props.grabbedNotification || this.props.grabbedNotification.data.length <=0 ? null :
            <Text style={{fontFamily:'regular', fontSize:18, color:argonTheme.COLORS.LABEL, marginRight:5}}>{`(${this.props.grabbedNotification.data.length})`}</Text>
          }
        </Block>
        <Block flex={1} style={{marginTop:6}}>
          {
            this.state.approved ? null :
            <Block style={{...styles.shadow, paddingVertical: 10, backgroundColor:'black', alignItems:'center', justifyContent:'center'}}>
              <Block row style={{alignItems:'center', justifyContent:'center'}}>
                <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.WHITE}}>Nofications is currently disabled.</Text>
                <TouchableOpacity onPress={this.enableNotification}>
                  <Block style={{}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.LABEL}}>  Enable here!</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
              {
                Platform.OS==='android'? null :
                <Block>
                  <Text style={{fontFamily:'regular', fontSize:12, color:argonTheme.COLORS.WHITE, marginTop:4}}>Or go to your phone settings to enable notification</Text>
                </Block>
              }
            </Block>
          }
          <Block flex={1}>
            <FlatList
              style={{flex: 1}}
              alwaysBounceVertical={true}
              showsVerticalScrollIndicator={false}
              data={this.props.grabbedNotification.data}
              keyExtractor={pp => pp._id}
              ListEmptyComponent={this.emptyList}
              renderItem={this.renderNotificationItems}
            />
          </Block>
        </Block>
      </Block>
    );
  }
  privacy = () => {
    return(
      <Block flex={1} style={{paddingHorizontal:15}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>Privacy Policy</Text>
        </Block>
        <Block flex={1} style={{marginTop:6}}>
          <WebView
            source={{uri: 'https://github.com/facebook/react-native'}}
            style={{marginTop: 1, flex:1,}}
          />
        </Block>
      </Block>
    );
  }
  payment = () => {
    return(
      <Block flex={1} style={{paddingHorizontal:15}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
          <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>Edit Payment Options</Text>
        </Block>
        <Block flex={1}>
          <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
            <Block flex={1}>
              <Block style={{marginBottom:10, marginTop:15}}>
                <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>Payment Details</Text>
                <Block row space='around' style={{marginTop:10, marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>Currency Type:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{this.state.card.currencytype || 'USD (Default)'}</Text>
                  </Block>
                </Block>
                <Block row space='around' style={{ marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>Card Type:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{this.state.card.type}</Text>
                  </Block>
                </Block>
                <Block row space='around' style={{marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>Card Number:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{`**** **** **** ${this.cardNumber(this.state.card.number)}`}</Text>
                  </Block>
                </Block>
                <Block row space='around' style={{marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>Expiry Date</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{`${this.state.card.expiryM}/${this.state.card.expiryY}`}</Text>
                  </Block>
                </Block>
              </Block>
              <Block style={{marginBottom:10, marginTop:15}}>
                <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>Billing Address</Text>
                <Block row space='around' style={{marginTop:10, marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>Address:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{`${this.state.billing.address}` || 'Not Available'}</Text>
                  </Block>
                </Block>
                <Block row space='around' style={{marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>City:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{this.state.billing.city || 'Not Available'}</Text>
                  </Block>
                </Block>
                <Block row space='around' style={{marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>State:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text numberOfLines={4} style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{this.state.billing.state || 'Not Available'}</Text>
                  </Block>
                </Block>
                <Block row space='around' style={{marginLeft:20, marginBottom:10}}>
                  <Block flex={0.4} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACK}}>Zip:</Text>
                  </Block>
                  <Block flex={0.6} style={{alignItems:'flex-start'}}>
                    <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS}}>{this.state.billing.zip || 'Not Available'}</Text>
                  </Block>
                </Block>
              </Block>
              <Block style={{marginTop:40}}>
                  <TouchableOpacity style={{marginBottom:10}} onPress={this.showEditCardDetails}>
                    <Block style={{paddingVertical:10, borderBottomWidth:StyleSheet.hairlineWidth, marginBottom:1, borderColor:'#999999', alignItems:'center'}}>
                      <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.ACTIVE}}>Edit Card Details</Text>
                    </Block>
                  </TouchableOpacity>
                  <TouchableOpacity style={{marginBottom:10}} onPress={this.showBillingEdit}>
                    <Block style={{paddingVertical:10, borderBottomWidth:StyleSheet.hairlineWidth, marginBottom:1, borderColor:'#999999', alignItems:'center'}}>
                      <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.ACTIVE}}>Edit Billing Address</Text>
                    </Block>
                  </TouchableOpacity>
                  <TouchableOpacity style={{marginBottom:10}} onPress={this.removeCardDetails}>
                    <Block style={{paddingVertical:10, borderBottomWidth:StyleSheet.hairlineWidth, marginBottom:1, borderColor:'#999999', alignItems:'center'}}>
                      <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.ACTIVE}}>Delete Payment Details</Text>
                    </Block>
                  </TouchableOpacity>
              </Block>
            </Block>
          </ScrollView>
        </Block>
      </Block>
    );
  }
  about = () => {
    return(
      <Block flex={1} style={{paddingHorizontal:20}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:argonTheme.COLORS.BLACKS, paddingVertical:4}}>
          <Text style={{fontFamily:'bold', fontSize:18, color:argonTheme.COLORS.BLACKS}}>About Lynkzed</Text>
        </Block>
        <Block flex={1} style={{marginTop:20}}>
          <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
            <Block >
              <Text style={{fontFamily:'bold', fontSize:18, color:argonTheme.COLORS.BLACKS}}>Lynkzed</Text>
              <Text style={{fontFamily:'regular', fontSize:16, color:argonTheme.COLORS.BLACKS, textAlign:'justify', lineHeight:20}}>
              {`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}</Text>
            </Block>
            <Block style={{marginTop:40}}>
              <Text style={{fontFamily:'bold', fontSize:12, color:'#999999'}}>For more information:</Text>
              <Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.ACTIVE}}>www.lynkzed.com</Text>
            </Block>
            <Block style={{marginTop:20}}>
              <Text style={{fontFamily:'bold', fontSize:12, color:'#999999'}}>Email:</Text>
              <Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.ACTIVE}}>help@lynkzed.com</Text>
            </Block>
            <Block style={{marginTop:20}}>
              <Text style={{fontFamily:'bold', fontSize:12, color:'#999999'}}>Like us on Facebook:</Text>
              <Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.ACTIVE}}>lynkzed.facebook.com</Text>
            </Block>
            <Block style={{marginTop:20}}>
              <Text style={{fontFamily:'bold', fontSize:12, color:'#999999'}}>twitter:</Text>
              <Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.ACTIVE}}>@lynkzed</Text>
            </Block>
          </ScrollView>
        </Block>
      </Block>
    );
  }

  renderTabs = (item) => {
    return(
      <TouchableOpacity key={item.title} onPress={() => this.selection(item.title)}>
      <Block flex row style={{width:width, alignItems: 'center', marginBottom: 35, paddingHorizontal: 8}}>
        <Block flex={0.12} style={{marginRight:1, marginLeft:2}}>
          <Icon
            name={item.iconName}
            family= {item.iconFamily}
            prefix="Light"
            size={28}
            color= {argonTheme.COLORS.BLACK}
          />
          {item.title==='Notifications' ? <Block middle style={styles.notify} /> : null }
        </Block>
        <Block flex={0.78} style={{justifyContent: 'flex-start'}}>
          <Text size={20} style={{color:argonTheme.COLORS.BLACK, alignItems: 'center'}}>{item.title}</Text>
        </Block>
        <Block flex={0.1} style={{ justifyContent: 'flex-end', alignItems:'center'}}>
          <Icon
          name='right'
          family = 'AntDesign'
          size={20}
          color= {argonTheme.COLORS.GREY} />
        </Block>
      </Block>
      </TouchableOpacity>
    );
  }

  render() {
    // console.log(this.props.country);
    return (
      <Block flex style={{marginTop: Platform.OS === "android" ? 0:HeaderHeight,  zIndex: 0}}>
        <StatusBar hidden />
        {
          this.state.loading===true ? <Block center middle style={{ position:'absolute', zIndex:100000 }}><Spinner color={argonTheme.COLORS.GRADIENT_END} label='Loading...' /></Block>:null
        }
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} style={{height:"100%", width:width}}>
          <Block flex style={{width:width, alignItems:'center', marginTop: 10}}>
            <Block style={{...styles.group}}>
              <Block column style={{justifyContent: 'space-between', marginTop: 20}}>
                {option.map(value => this.renderTabs(value))}
                <Block style={{width:width, borderTopWidth: StyleSheet.hairlineWidth, borderColor: argonTheme.COLORS.BLACKS, marginTop: 40, paddingHorizontal: 0, marginLeft: 0}}/>
                <Button style={{width:width, marginTop: 10, backgroundColor:'transparent', elevation: 0, border: 0, shadow:0}} onPress={this.checkLogged}>
                  <Block row style={{width:width, alignItems: 'center' }}>
                    <Block style={{marginRight:10, marginLeft:2, paddingVertical: 10, paddingHorizontal: 10}}>
                      <Icon
                        name="remove-circle-outline"
                        family="Ionicons"
                        prefix="Light"
                        size={28}
                        color= {argonTheme.COLORS.BLACK}
                      />
                    </Block>
                    <Block style={{ justifyContent: 'center', padding: 5}}>
                      <Text size={20} style={{color:argonTheme.COLORS.BLACK, alignItems: 'center', padding: 5}}>Log Out</Text>
                    </Block>
                  </Block>
                </Button>
              </Block>
            </Block>
          </Block>
        </ScrollView>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.showAvatar}
          onRequestClose={() => {
            return;
          }}>
            {this.avatarTab()}
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.editCard}
          onRequestClose={() => {
            return;
          }}>
            {this.updatePaymentTab()}
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.editBilling}
          onRequestClose={() => {
            return;
          }}>
            {this.updateBillingAddress()}
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.overlayer}
          onRequestClose={() => {
            return;
          }}>
            <Block flex={1}>
              <Block style={{marginTop:30}}>
                <TouchableOpacity onPress={this.closeOverlayer} style={{alignItems:'flex-end', paddingHorizontal:15}}>
                    <Block row space='between'>
                        <Icon
                            style={{marginRight: 10}}
                            family='Ionicon'
                            name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                            size={30}
                            color='#999999'
                        />
                        <Block style={{justifyContent:'center', alignItems:'center'}}>
                          <Text style={{fontFamily:'bold', fontSize: 18, color:'#999999'}}>CLOSE</Text>
                        </Block>
                    </Block>
                </TouchableOpacity>
              </Block>
              <Block flex={1} style={{marginTop:20}}>
                  {this.state.openedTab===option[0].title ? this.editProfile():null}
                  {this.state.openedTab===option[1].title ? this.inviteFriends():null}
                  {this.state.openedTab===option[2].title ? this.notification():null}
                  {this.state.openedTab===option[3].title ? this.privacy():null}
                  {this.state.openedTab===option[4].title ? this.payment():null}
                  {this.state.openedTab===option[5].title ? this.about():null}
              </Block>
            </Block>
        </Modal>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 3,
    paddingBottom: androidPhone ? 10 : 0,
    backgroundColor: argonTheme.COLORS.PRIMARY,
    width: width,
    minHeight: '15%',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    borderBottomWidth: 0,
    borderTopWidth: 0.4,
    borderColor: theme.COLORS.GREY
  },
  title: {
    paddingBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
    marginTop: 44,
    color: argonTheme.COLORS.HEADER
  },
  group: {
    marginBottom: theme.SIZES.BASE * 1.2,
    width: width
  },
  options: {
    paddingBottom: height >= 699 ? '10%':'5%',
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 4
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10
  },
  options: {
    elevation: 4,
    minHeight: '17%',
    paddingBottom: height >= 699 ? '10%':'2.7%',
  },
  tab: {
    overflow: 'hidden',
    paddingTop: iPhoneX ? theme.SIZES.BASE * 0.5 : theme.SIZES.BASE,
  },
  notify: {
    backgroundColor: argonTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 0,
    left: 1,
  },
});

const mapStateToProps = function(state) {
  return {
    grabbedNotification: state.dashboard.notifications,
    compareContacts: state.dashboard.compareContacts,
    photos: state.dashboard.photos,
    country: state.profile.country,
    //loggedIn: state.auth.loggedIn
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    profileActions: bindActionCreators(profileActions, dispatch),
    dash: bindActionCreators(dash, dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Settings);