import React from "react";
import {
  FlatList, ActivityIndicator, KeyboardAvoidingView,
  StyleSheet, TouchableOpacity, RefreshControl,
  Platform, Alert, Modal, Keyboard,
} from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import * as dash from '../store/actions/dashboard';
import * as ordersAction from '../store/actions/orders';
import Payment from '../payment/Payment';
import { Button as Btn, Rating, ListItem } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
//galio
import { Block, Text, theme } from "galio-framework";
//argon
import { Services, Odb } from "../actionable";
import { argonTheme } from "../constants/";
import { Overlayer, ScheduleDate, Card, Icon, InsideContainer, EmptyList, FInput, Spinner } from "../components/";
import { HeaderHeight,width,height } from "../constants/utils";
const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;

class Orderx extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      loading:false,
      orderOptions:false,
      reviewContainer:false,
      overlay:false,
      orders: false,
      cart: false,
      options: false,
      itemSelected: null,
      totalPrice:0,
      totalItems:null,
      checkOutOverlay: false,
      setReward: false,
      payment:false,
      userDetails: null,
      cardDetails: null, 
      billing: null,
      amount:0,
      ordersPage:1,
      reviewPage:1,
      success:false,
      selectedDate:null,
      reviewText:null,
      error:false,
      errorText:null,
      filtered_ratings:0,
    }
  }

  componentWillMount(){
    this.props.navigation.setParams({ 
      tabClickChanges: this.tabClickChanges,
      headerTitle: 'Shopping Cart',
    });
    return this.tabClickChanges();
  }

  async componentDidMount(){
    this.calculateTotal();
    await this.getPayment();
    return;
  }

  // orderNotifications
  async componentDidUpdate(prevProps) {
    if(this.props.cart.length !== prevProps.cart.length){
      this.calculateTotal();
    }
    if(this.props.cart !== prevProps.cart){
      this.calculateTotal();
    }
    if(this.props.cart !== prevProps.cart){
      this.checkItems();
    }
    if(this.props.orders.length > prevProps.orders.length){
      this.setState({ordersPage:this.state.ordersPage+1});
    }
    if(this.props.reviewedPost.length > prevProps.reviewedPost.length){
      this.setState({reviewPage:this.state.reviewPage+1});
    }
    if(this.props.submittedReview == true){
      this.updateReview();
    }
    return;
  }

  getPayment = async() =>{
    const userDetails = await Services.profileInformation();
    const payment = await Services.getPaymentData();
    if(userDetails){
      this.setState({userDetails});
    }
    if(payment){
      const { cardDetails, billing } = payment;
      this.setState({cardDetails, billing})
    }
    return;
  }

  checkItems = () => {
    let result; let length;
    if(!this.props.cart || this.props.cart.length <=0){
      return;
    }
    length = this.props.cart.length;
    result = this.props.cart.map(el => el.time !== 'n/a');
    if(result){
      if(length > 1){
        return Services.allAlert(Alert,'Cart Mismatch', 'Mixing scheduling with other cart items or multiple scheduling is not allowed', 'Try Again', 'destructive', this.emptyCart, false);
      }
      return;
    }
    return;
  }

  emptyCart = () => {
    return this.props.ordersAction.emptyCart();
  }

  checkOutPress = async() => {
    await this.getPayment();
    return this.setState({checkOutOverlay: true, payment:false,})
  }

  closeCheckOutPress = () => {
    return this.setState({checkOutOverlay: false})
  }

  fetchOrders = async() => {
    try{
      this.setState({loading:true})
      await this.props.ordersAction.fetchOrders(this.state.ordersPage);
      return this.setState({loading:false});
    }catch(err){
      return Services.allAlert(Alert,'Error', 'Error fetching your orders', 'Try Again', 'destructive', this.fetchOrders, true);
    }
  }

  loadMoreOrders = async() => {
    await this.fetchOrders();
  }

  tabClickChanges = (elm) => {
    if(!elm) {
      this.setState({cart: true});
    } else {
      if(elm.tabId === 'order'){
        return this.setState({orders: true, cart:false}, async() =>{
          this.props.navigation.setParams({...elm, headerTitle:'Orders'});
          await this.fetchOrders();
        })
      }
      if(elm.tabId === 'cart'){
        this.setState({orders: false, cart:true}, () =>{
          this.props.navigation.setParams({...elm, headerTitle: 'Shopping Cart'});
        })
      }
    }
  }

  calculateTotal = () => {
    let result = 0.00;
    const { cart } = this.props
    if(cart.length > 0){
      result = cart.map(el => {
        const qty = !el.qty ? 0 : parseFloat(el.qty);
        const price = !el.price ? 0 : parseFloat(el.price);
        const discount = !el.discount ? 0 : parseFloat(el.discount);
        const pri = (qty*price);
        return ((pri) - ((discount/100)*pri));
      });
      result = result.map( el => parseInt(el)).reduce((a, b) => a + b, 0);
      return this.setState({totalPrice: result.toFixed(2), totalItems:cart.length});
    }
    return result;
  }

  headerPressCancel = () => {
    return this.setState({options:false,orderOptions:false});
  }

  saveItemLater = async() => {
    this.setState({options:false});
    try{
      await this.props.dash.savePostingItem(this.state.itemSelected._id);
      return Services.allAlert(Alert,'Status', 'Your item is saved successfully', 'OK', 'default', this.cartRemove, false);
    }catch(err){
      if(err.status === 2){
        return Services.allAlert(Alert,'Status', 'Your item is saved successfully', 'OK', 'default', this.cartRemove, false);
      }
      return Services.allAlert(Alert,'Error', 'An error occured', 'Try Again', 'destructive', this.saveItemLater, true);
    }
  }

  viewThisItem = async() => {
    // console.log(this.state.itemSelected);
    const item = !this.state.itemSelected.post ? this.state.itemSelected : this.state.itemSelected.post;
    this.setState({options:false,orderOptions:false});
    try{
      await this.props.dash.storeView(item);
    }catch(err){
      return Services.allAlert(Alert,'Error', 'Item navigation error', 'Try Again', 'destructive', this.viewThisItem, true);
    }
    return this.props.navigation.navigate('Product');
  }

  cartRemove = async() => {
    this.setState({options:false});
    try{
      await this.props.ordersAction.removeItem(this.state.itemSelected);
      // this.calculateTotal();
      return this.setState({itemSelected: null})
    }catch(err){
      return Services.allAlert(Alert,'Error', 'An error occurred', 'Try Again', 'destructive', this.cartRemove, true);
    }
  }

  addDeduct = async(x) => {
    try{
      await this.props.ordersAction.miscIncrease(x, this.state.itemSelected._id);
    }catch(err){
      return Services.allAlert(Alert,'Error', 'An error occurred', 'Try Again', 'destructive', this.addDeduct, true);
    }
  }

  openOptions = (item) => {
    return this.setState({itemSelected: item, options:true, orderOptions:false});
  }

  openOrderOptions = (item) => {
    return this.setState({itemSelected: item, options:false, orderOptions:true});
  }

  closeOverlayer = () => {
    return this.setState({success:false, overlay:false, reviewContainer:false});
  }

  reviewItem = async() => {
    this.setState({loading:true, error:false, success:false, overlay:false, reviewContainer:true, orderOptions:false});
    try{
      if(this.state.itemSelected.post._id !== this.props.currentReviewID){
        this.setState({reviewPage: 1})
      }
      await this.props.ordersAction.productsReviews(this.state.reviewPage, this.state.itemSelected.post._id);
      this.setState({loading:false});
    }catch(err){
      this.setState({loading:false, error:true, errorText:err.message});
    }
  }

  buyNow = async() => {
    let result;
    this.setState({orderOptions:false});
    const { actiontype } = this.state.itemSelected.post;
    if(actiontype && actiontype === 'register'){
      return this.setState({overlay:true});
    }
    await this.props.ordersAction.addCartItem(this.state.itemSelected.post, null);
    this.setState({success:true, overlay:true, itemSelected:null, selectedDate:null});
  }

  gotoPayment = (x) => {
    return this.setState({payment:!this.state.payment, amount:x});
  }

  finishPayment = async(x) => {
    if(x === 'Successful'){
      await this.emptyCart()
      this.calculateTotal();
      this.tabClickChanges("order");
      return this.setState({checkOutOverlay:false,totalPrice: 0, totalItems:0, orders:true});
    }
  }

  bookingChecker = async() => {
    const { selectedDate, itemSelected} = this.state;
    const { bizname, displayName } = itemSelected.post.creator;
    const namet = !bizname || bizname==='null' ? displayName : bizname;
    if(!selectedDate){
      return this.setState({loading:false});
    }
    try{
      await this.props.dash.confirmSchedule(selectedDate, itemSelected.post.creator._id);
      if(!this.props.scheduling || this.props.scheduling.length <=0){
        await this.props.ordersAction.addCartItem(itemSelected.post, selectedDate);
        return this.setState({loading:false, success:true, overlay:true, itemSelected:null, selectedDate:null});
      }
      return await this.compareDate();
    }catch(err){
      this.setState({loading:false, overlay:true});
      return Services.allAlert(Alert,'Status', `Error confirming ${namet}'s availability for ${selectedDate}.`, 'Try Again', 'destructive', this.submitBookings, true);
    }
  }
  compareDate = async() => {
    let result;
    const { selectedDate, itemSelected} = this.state;
    const { bizname, displayName } = itemSelected.post.creator;
    const namet = !bizname || bizname==='null' ? displayName : bizname;
    if(!this.props.scheduling){
      return await this.submitBookings()
    }
    result = this.props.scheduling.filter(x => moment(x.date).format('YYYY-MM-DD hh:mm') === moment(selectedDate).format('YYYY-MM-DD hh:mm') || moment(x.date).format('YYYY-MM-DD hh:mm') === moment(selectedDate).add(1,"hours").format('YYYY-MM-DD hh:mm'));
    if(result.length > 0){
      this.setState({loading:false, overlay:true});
      return Services.allAlert(Alert,'Status', `${namet} is already scheduled for ${selectedDate}.`, 'Try Again', 'destructive', null, false);
    }
    await this.props.ordersAction.addCartItem(itemSelected.post, selectedDate);
    return this.setState({loading:false, success:true, overlay:true, itemSelected:null, selectedDate:null});
  }

  submitBookings = async() => {
    const { itemSelected } = this.state;
    this.setState({overlay:false, loading:true});
    if(!this.props.scheduling || this.props.scheduling.user !== itemSelected.post.creator._id){
      await this.props.dash.removeSchedules();
      return await this.bookingChecker();
    }
    return await this.bookingChecker();
  }

  ///Review
  reviewListing = ({item}) => (
    <ListItem
      leftAvatar={{ source: { uri: Odb.dbUrl + item.user.img } }}
      title={item.user.displayName}
      titleStyle={{fontFamily:'bold', fontSize:15}}
      subtitle={item.text}
      subtitleStyle={{fontFamily:'regular', fontSize:12, color:'#999999'}}
      bottomDivider
      rightElement = {
          <Rating
            type='star'
            ratingColor='#6B24AA'
            ratingCount={5}
            imageSize = {15}
            startingValue={item.review}
            readonly
          />
      }
    />
  );

  submitReview = async() => {
    const { filtered_ratings, reviewText, itemSelected } = this.state;
    try{
      this.setState({loading:true});
      await this.props.ordersAction.submitReviews(filtered_ratings, reviewText, itemSelected._id, itemSelected.post._id);
      this.setState({loading:false, filtered_ratings:0, reviewText:null});
      Keyboard.dismiss();
      return this.updateReview();
    }catch(err){
      if(err.message === 'You already reviewed this item!'){
        this.setState({loading:false, filtered_ratings:0, reviewText:null});
        Keyboard.dismiss();
        return Services.allAlert(Alert,'Rewiewed', err.message, 'OK', 'default', null, false);
      }
      if(err.message === "Could'nt update reward"){
        return;
      }
      return Services.allAlert(Alert,'Error', err.message, 'Try Again', 'default', this.submitReview, true);
    }
  }

  updateReview = async() =>{
    this.setState({reviewPage: 1});
    await this.reviewItem();
    await this.updateReward();
  }

  updateReward = async() => {
    try{
      await this.props.ordersAction.fetchRewards(1);
    }catch(err){
      return Services.allAlert(Alert,'Error', "Couldn't update reward", 'Try Again', 'default', this.updateReward, true);
    }
  }

  //End of Review 

  renderCards = ({item}) => {
    return (
      <Block flex style={styles.group}>
        <Block flex>
          <Block style={{ paddingHorizontal: 4 }}>
            <Card item={item} horizontal imageStyle={this.state.orders && {width:width*0.3}}
              order={this.state.orders ? true : false}
              cart={this.state.cart ? true : false}
              actionFn={() => this.state.orders ? this.openOrderOptions(item) : this.openOptions(item)} />
          </Block>
        </Block>
      </Block>
    );
  };

  render() {
    const itemButton = !this.state.itemSelected ? null : !this.state.itemSelected.post ? null : !this.state.itemSelected.post.button ? null : this.state.itemSelected.post.button==='null' ? null : this.state.itemSelected.post.button;
    return (
      <Block flex>
        {
          this.state.loading &&
          <Block center style={{ position:'absolute', bottom: 180, zIndex:10 }}><Spinner color={argonTheme.COLORS.GRADIENT_START}/></Block>
        }
        <Block row space='between'>
          <Text style={styles.title}>
            {!this.state.totalItems ? `My Order (${this.props.orderTotal})` : `${this.state.totalItems} Cart ${this.state.totalItems > 1 ? 'Items': 'Item'}`}
          </Text>
          <Text style={{...styles.title, color: argonTheme.COLORS.GRADIENT_START}}>
            {!this.state.totalItems ? null : `Total: ${this.state.totalPrice}`}
          </Text>
        </Block>
        <Block flex>
          <FlatList
            extraData={this.props}
            style={{flex:1, width:width}}
            alwaysBounceHorizontal={false}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            refreshing={this.state.loading}
            onEndReachedThreshold={!this.state.orders ? null : 1}
            onEndReached={!this.state.orders ? null : this.loadMoreOrders}
            ListEmptyComponent={<EmptyList x={!this.state.orders ? 'Cart is Empty' : 'Order is Empty. Start Ordering!'}/>}
            initialNumToRender={!this.state.orders ? null : 4}
            data={!this.state.orders ? this.props.cart : this.props.orders}
            keyExtractor={pp => pp._id}
            contentContainerStyle={{width: width}}
            renderItem={this.renderCards}
          /> 
        </Block>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.checkOutOverlay}
          onRequestClose={() => {
            return;
          }}>
            <Block style={{marginTop:30}}>
              <TouchableOpacity onPress={this.closeCheckOutPress} style={{alignItems:'flex-start', paddingHorizontal:15}}>
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
            {
              this.state.payment ? <Block flex={1} style={{marginTop:90}}><Payment data={{user:this.state.userDetails,card:this.state.cardDetails,billing:this.state.billing, data: this.state.amount, cart:this.props.cart, 
                rewardsapply:!this.state.setReward ? 0.00:0.00, done:this.finishPayment}} /></Block>
               :
              <InsideContainer close={this.closeCheckOutPress} cart myList={this.props.cart} myReward={() =>this.setState({setReward:!this.state.setReward})} 
              reward={this.state.setReward?this.props.rewards : 0} extra={this.gotoPayment}/>
            }
        </Modal>
        {
            this.state.cart ? 
            <Block center row style={{position: 'absolute', bottom: 10, right:5, zIndex:10, ...styles.shadow}}>
              <TouchableOpacity shadowless={true} onPress={this.checkOutPress}
                  style={{height:60,width:60,borderRadius:30, backgroundColor:argonTheme.COLORS.GRADIENT_START, alignItems:'center',overflow:"hidden", borderWidth:1, borderColor:argonTheme.COLORS.HEADER }}>
                  <Block style={{height:60,width:60,borderRadius:30, alignItems:'center', justifyContent:'center'}}>
                    <Icon
                      name={Platform.OS==='android'? 'md-cart' : 'ios-cart'}
                      family = 'Ionicon'
                      size={22}
                      color={argonTheme.COLORS.WHITE}
                      />
                    <Text style={{fontFamily: 'bold', fontSize:10, color:argonTheme.COLORS.WHITE}}>checkout</Text>
                  </Block>
              </TouchableOpacity>
          </Block> : null
          }
          {
          this.state.options &&
          <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
            <Block style={{...styles.floatInside, paddingHorizontal: 0, marginBottom: Platform.OS==='android' ? 18 : 18}}>
              <Block style={{flex:1}}>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.32}} onPress={this.cartRemove}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ERROR}}>Remove from Cart</Text>
                  </Block>
                </TouchableOpacity>
                <Block shadowless style={{...styles.optionBtn, flex:0.36}}>
                  <Block row style={{justifyContent:'space-around', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <TouchableOpacity onPress={() => this.addDeduct(1)}>
                      <Block>
                        <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START}}>+ Increase Qty</Text>
                      </Block>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.addDeduct(-1)}>
                      <Block>
                        <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_END}}>- Decrease Qty</Text>
                      </Block>
                    </TouchableOpacity>
                  </Block>
                </Block>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.36}} onPress={this.viewThisItem}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>View Item</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.36}} onPress={this.saveItemLater}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Save item for later</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.32}} onPress={this.headerPressCancel}>
                  <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 10 }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Done</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
            </Block>
          </Block>
        }
        {
          this.state.orderOptions &&
          <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
            <Block style={{...styles.floatInside, height:170, paddingHorizontal: 0, marginBottom: Platform.OS==='android' ? 18 : 18}}>
              <Block style={{flex:1}}>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.24}} onPress={this.reviewItem}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Rate this Item</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.25}} onPress={this.viewThisItem}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>View Item</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.25}} onPress={this.buyNow}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>{`Re: ${itemButton}`}</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity shadowless style={{...styles.optionBtn, flex:0.24}} onPress={this.headerPressCancel}>
                  <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 10 }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Done</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
            </Block>
          </Block>
        }
        {
          this.state.overlay === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
            <Overlayer small btnPress={this.closeOverlayer}>
              {
                this.state.success ?
                <Block flex={1} middle style={{justifyContent:'center', alignItems:'center', borderTopWidth:StyleSheet.hairlineWidth, borderColor:'#999999'}}>
                  <Block style={{justifyContent:'center', alignItems:'center'}}>
                    <Ionicons
                        style={{marginRight: 10}}
                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                        size={56}
                        color= {argonTheme.COLORS.SUCCESS}
                    />
                    <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Item Added to Cart</Text>
                  </Block>
                </Block> :
                <Block style={{paddingHorizontal: 10}}>
                <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4, }}>
                  {
                    this.state.loading ? 
                    <Text style={{fontFamily:'regular', fontSize:18, color:argonTheme.COLORS.GRADIENT_END}}>...confirming schedule</Text> :
                    <Text style={{fontFamily:'regular', fontSize:18, color:'#428bca'}}>Selected item requires scheduling</Text>
                  }
                </Block>
                  <Block style={{width:width, marginTop: 20, paddingHorizontal: 10}}>
                    <ScheduleDate selected={date =>this.setState({selectedDate:date})} prev={this.state.selectedDate}/>
                  </Block>
                  <Block center style={{marginBottom:15,marginTop:20, width: width*0.6, }}>
                    <Btn
                      title={itemButton}
                      titleStyle = {{fontFamily:'bold', fontSize: 20}}
                      type="outline"
                      raised
                      onPress={this.submitBookings}
                      loading={this.state.loading}
                      loadingProps={<ActivityIndicator size="small" color='#428bca' />}
                      icon={
                        <Ionicons
                          name={Platform.OS==='ios'? 'ios-send' : 'md-send'}
                          size={28}
                          color='#428bca'
                          style={{marginRight:15}}
                        />
                      }
                    />
                  </Block> 
                </Block>
              }
            </Overlayer></Block>
        }
        {
          this.state.reviewContainer && <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
              <Overlayer full btnPress={this.closeOverlayer}>
                  <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={Platform.OS==='ios'? HeaderHeight*3.6:HeaderHeight*2.3}>
                      <Block style={{padding:5, flex:1}} >
                          <Block style={{flex:0.8}} onPress={Keyboard.dismiss}>
                              <Block row space='between' style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
                                  <Text style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>Review</Text>
                                  {this.state.error ? <Text style={{fontFamily:'regular', fontSize:14, color:'red'}}>{`${this.state.errorText}`}</Text> : null}
                              </Block>
                              <Block flex={1} style={{ marginTop:2}}>
                                <FlatList
                                  ListEmptyComponent={this.emptyList}
                                  extraData={this.props.reviewedPost}
                                  data={this.props.reviewedPost}
                                  style={{flex: 1}}
                                  ListEmptyComponent={<EmptyList x='No reviews for this item. Be the first to review!'/>}
                                  showsVerticalScrollIndicator={false}
                                  alwaysBounceVertical={true}
                                  refreshControl={
                                    <RefreshControl
                                     refreshing={this.state.loading}
                                     onRefresh={this.reviewItem}
                                    />
                                  }
                                  removeClippedSubviews
                                  keyExtractor= {p => p._id}
                                  renderItem = {this.reviewListing}
                                />
                            </Block>
                          </Block>
                          <Block style={{marginBottom:Platform.OS==='android' && 1}}>
                            <Rating
                              // reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
                              ratingTextColor={argonTheme.COLORS.GRADIENT_START}
                              type='star'
                              ratingColor='#6B24AA'
                              ratingCount={5}
                              showRating
                              imageSize = {20}
                              minValue= {0}
                              startingValue={this.state.filtered_ratings}
                              fractions={1}
                              onFinishRating={value => {this.setState({filtered_ratings: value})}}
                              />
                          </Block>
                      </Block>
                      <Block row space='between' style={{borderWidth:1, borderColor: argonTheme.COLORS.GRADIENT_END, padding:12, borderRadius:20, marginHorizontal:10, zIndex:1000 }}>
                          <Block flex={0.8}>
                              <FInput
                                lcolor={argonTheme.COLORS.GRADIENT_START}
                                lfont={18}
                                label = 'Enter review here...'
                                small
                                noBorder
                                multiline
                                value={this.state.reviewText}
                                onChangeText={text =>  this.setState({reviewText:text})}
                                autoCapitalize = "sentences"
                                returnKeyType= {Platform.OS==='ios'?'next':'none'}
                                style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START,height: Platform.OS==='android'?60:40}}
                              />
                          </Block>
                          <Block style={{height:'auto', alignItems:'center', justifyContent:'center'}} flex={0.2}>
                              <TouchableOpacity style={{padding:5}} onPress={this.submitReview}>
                                  <Block style={{ padding: 5, backgroundColor:Platform.OS==='android'? argonTheme.COLORS.GRADIENT_END:'transparent'}}>
                                      <Text style={{fontSize:12, fontFamily:'regular', 
                                      color: Platform.OS==='android' ? 'white' : argonTheme.COLORS.GRADIENT_END}}>SUBMIT</Text>
                                  </Block>
                              </TouchableOpacity>
                          </Block>
                      </Block>
                  </KeyboardAvoidingView>
              </Overlayer>
          </Block>
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
    zIndex:20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: width,
    bottom: Platform.OS==='android' ? 1 : 5
  },
  floatInside: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius:4, 
    width:width-theme.SIZES.BASE, 
    height: 220, zIndex:5, 
    marginBottom: 15, 
    backgroundColor:'#FFF', 
    elevation: 5,
    zIndex:5,
    opacity: 1,
    borderColor: argonTheme.COLORS.GRADIENT_START,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    paddingHorizontal: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE/2,
    marginTop: 6,
    color: argonTheme.COLORS.HEADER,
    fontFamily: 'bold',
    fontSize: 16
  },
  group: {
    paddingTop: theme.SIZES.BASE
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  },
  category: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE / 2,
    borderWidth: 0
  },
  categoryTitle: {
    height: "100%",
    paddingHorizontal: theme.SIZES.BASE,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  imageBlock: {
    overflow: "hidden",
    borderRadius: 4
  },
  productItem: {
    width: cardWidth - theme.SIZES.BASE * 2,
    marginHorizontal: theme.SIZES.BASE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.2
  },
  productImage: {
    width: cardWidth - theme.SIZES.BASE,
    height: cardWidth - theme.SIZES.BASE,
    borderRadius: 3
  },
  productPrice: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2
  },
  productDescription: {
    paddingTop: theme.SIZES.BASE
    // paddingBottom: theme.SIZES.BASE * 2,
  },
  shadow: {
    shadowColor: argonTheme.COLORS.GRADIENT_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 4
  },
});

const mapStateToProps = function(state) {
  return {
    cart: state.orders.carts,
    orders: state.orders.orders,
    ordersPage: state.orders.ordersPage,
    orderTotal: state.orders.orderTotal,
    reviewedPost: state.orders.reviewedPost,
    currentReviewID: state.orders.currentReviewID,
    submittedReview: state.orders.submittedReview,
    rewards: state.orders.rewards,
    scheduling: state.dashboard.scheduling,
    //loggedIn: state.auth.loggedIn
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    ordersAction: bindActionCreators(ordersAction, dispatch),
    dash: bindActionCreators(dash, dispatch)
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(Orderx);
