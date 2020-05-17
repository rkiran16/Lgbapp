import React from 'react';
import { ActivityIndicator, StyleSheet, StatusBar, Dimensions, Animated, RefreshControl,
    Platform, FlatList, TouchableOpacity, ScrollView, KeyboardAvoidingView, Keyboard, Alert } from 'react-native';
import { connect } from 'react-redux';
import MapView, { Marker } from 'react-native-maps';
import * as dash from '../store/actions/dashboard';
import { Block, Text, theme } from 'galio-framework';
import { Image, Rating, ListItem, Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { argonTheme } from '../constants/';
import { Card, FInput, EmptyList, PostItem, Spinner, Overlayer } from '../components/';
import { HeaderHeight } from "../constants/utils";
import { Odb, Services } from "../actionable"
const { height, width } = Dimensions.get('screen');
import articles from '../constants/articles';

class Product extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.position = new Animated.ValueXY({x:0, y: Platform.OS==='android' ? 0.01 : 0});
        this.state = {
            reviewPager: 1,
            refreshing:false,
            commentOverlay:false,
            postComment:null,
            errorText:null,
            submitSuccess:false,
            submissionType:null,
            commentText:'',
            overlay: false,
            loading:false,
            error:false,
            errNum: null,
            item: null,
            details: true,
            reviews: false,
            comment: false,
            portfolio: false,
            portfolioItem: null,
            // reviewList: rrv,
            region: {
                longitude: -122,
                latitude: 37,
                longitudeDelta: 0.04,
                latitudeDelta: 0.09
            },
            similarItem: articles,
            hMoved: false,
            tSID:null,
            tCID:null
        };
    }

    async componentWillMount() {
        this._isMounted = true;
        const item =  this.props.storedView;
        return this.setState({item:item,details:true,reviews:false,comment:false,portfolio:false,error:false}, async()=>{
            try {
                const { category } = this.state.item;
                const catId = !category._id ? category : category._id;
                if(!catId) {
                    return;
                }
                return await this.props.findSimilarPost(1,catId,item._id);
            } catch(err){
                return;
            }
        })
    }

    async componentDidUpdate(prevProps) {
        if(this.props.reviewPost.data.length > prevProps.reviewPost.data.length){
            this.adjustPager();
        }
        if (this.props.storedView !== prevProps.storedView) {
            await this.newItemSelected();
        }
        return;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    adjustPager = (x) => {
        this.setState({reviewPager: this.state.reviewPager+1});
    }

    newItemSelected = async() => {
        const item =  this.props.storedView;
        this.setState({item:item, details:true, reviews:false, comment:false, portfolio:false, error:false, reviewPager:1 })
        try {
            const { category } = this.state.item;
            const catId = !category._id ? category : category._id;
            if(!category) {
                return;
            }
            await this.props.findSimilarPost(1,catId,item._id);
            return;
        } catch(err){
            return;
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

    postBtnPress = () => {
        console.log('taifun')
    }

    animateHeader = () => {
        Animated.spring(this.position, {
            toValue: { x: 0, y: -height*0.4},
            duration: 600
        }).start();
        return setTimeout(() => {this.setState({hMoved:true}, () =>{
            Animated.spring(this.position, {
                toValue: { x: 0, y: 0},
                duration:500
            }).start();
        }) },500)
    }

    returnHeader = () =>{
        this.setState({hMoved:false}, () => {
            Animated.spring(this.position, {
                toValue: { x: 0, y: -height*0.4},
                duration: 500
            }).start();
        });
        
        return setTimeout(() => {
            Animated.spring(this.position, {
                toValue: { x: 0, y: 0},
                duration:400
            }).start();
        },1000)
    }

    headerClickFunction = async(data) => {
        const { otherPost, commentsPost } = this.props;
        const { creator, _id } = this.state.item;
        if(data === 'd') {
            this.returnHeader();
            return this.setState({details:true,reviews:false,comment:false,portfolio:false});
        }
        if(data === 'r') {
            if(!this.state.hMoved){
                this.animateHeader();
            }
            this.setState({reviews:true,details:false,comment:false,portfolio:false, error:false, errNum:null, loading:true});
            try{
                await this.props.productReviews(this.state.reviewPager, _id);
                return this.setState({loading:false});
            } catch(err){
                return this.setState({loading:false, error:true, errNum:1});
            }
        }
        if(data === 'cc') {
            if(!this.state.hMoved){
                this.animateHeader();
            }
            this.setState({comment:true,details:false,reviews:false,portfolio:false, error:false, errNum:null});
            try{
                await this.props.productComments(commentsPost.pager, _id);
                return this.setState({loading:false});
            } catch(err){
                return this.setState({loading:false, error:true, errNum:2});
            }
        }
        if(data === 'p') {
            if(!this.state.hMoved){
                this.animateHeader();
            }
            this.setState({portfolio:true,details:false,reviews:false,comment:false,loading:true, error:false, errNum:null});
            try{
                await this.props.productPageOtherPosts(otherPost.pager, creator._id, _id);
                return this.setState({loading:false});
            } catch(err){
                console.log('kawak')
                return this.setState({loading:false, error:true, errNum:3});
            }
        }
    }

    loadMorePost = async() => {
        console.log('tatiana');
        const { portfolio, comment, reviews, item } = this.state;
        const { otherPost, commentsPost } = this.props;
        if(portfolio){
            this.setState({loading:true, error:false, errNum:null});
            try{
                await this.props.productPageOtherPosts(otherPost.pager, item.creator._id, item._id);
                if (this._isMounted) {
                    return this.setState({loading:false});
                }
                return;
            } catch(err){
                if (this._isMounted) {
                    return this.setState({loading:false, error:true, errNum:3});
                }
                return;
            }
        }
        if(comment){
            this.setState({loading:true, error:false, errNum:null});
            try{
                await this.props.productComments(commentsPost.pager, item._id);
                if (this._isMounted) {
                    return this.setState({loading:false});
                }
                return
            } catch(err){
                if (this._isMounted) {
                    return this.setState({loading:false, error:true, errNum:2});
                }
                return;
            }
        }
        if(reviews){
            console.log('mo n sare o')
            this.setState({loading:true, error:false, errNum:null});
            try{
                await this.props.productReviews(this.state.reviewPager, item._id);
                if (this._isMounted) {
                    return this.setState({loading:false});
                }
                return;
            } catch(err){
                if (this._isMounted) {
                    return this.setState({loading:false, error:true, errNum:1});
                }
                return;
            }
        }
    }

    tryAgain = () => {
        const { errNum } = this.state;
        if(!errNum) {
            return;
        }else if(errNum === 1) {
            return this.loadMorePost();
        }else if(errNum === 2){
            return this.loadMorePost();
        }else if(errNum === 3){
            return this.loadMorePost();
        }else if(errNum === 4){
            return this.submitTextComment();
        }else if(errNum === 5){
            return this.savePosting(this.state.tSID);
        }else if(errNum === 6){
            return this.showCommentOverlayer(this.state.tCID);
        }else if(errNum === 7){
            return this.loadMoreComment();
        }else{ return; }
    }

    submitTextComment = async() => {
        const { commentText, item, portfolioItem } = this.state;
        const id = !portfolioItem ? item._id : portfolioItem;
        try{
            this.setState({overlay:false, error:false, errNum:null, });
            await this.props.submitTextComment(id, commentText);
            return this.setState({portfolioItem:null,submitSuccess:true,submissionType:'comment',commentText:'',commentOverlay:false})
        }catch(err) {
            return this.setState({loading:false, error:true, errNum:4});
        }
    }

    savePosting = async(id) => {
        try {
          this.setState({loading:true, error:false, errNum:null, errorText:null, submissionType:null,tSID:id });
          await this.props.savePostingItem(id);
          return this.setState({loading:false, submissionType:'save',submitSuccess:true,tSID:null});
        }catch(err){
          if(err.status === 2){
            return this.setState({loading:false, submissionType:'save',submitSuccess:true});
          }
          return this.setState({loading:false, error:true, errNum:5, errorText:err});
        }
    }

    showCommentOverlayer = async(id) => {
        const { pager,item } = this.props.categoryPostComment;
        const page = item===id ? pager : 1;
        this.setState({commentOverlay:true, portfolioItem:id, refreshing:true, error:false, errNum:null, errorText:null, tCID: id});
        try {
          await this.props.showCategoryPostComment(page, id);
          return this.setState({postComment: id,refreshing:false, tCID:null});
        }catch(err) {
          return this.setState({loading:false, error:true, errNum:6, errorText:err});
        }
    }

    loadMoreComment = async() => {
        const { pager } = this.props.categoryPostComment;
        const { postComment } = this.state;
        this.setState({refreshing:true, error:false, errNum:null, errorText:null });
        try {
          await this.props.showCategoryPostComment(pager, postComment);
          return this.setState({refreshing:false});
        }catch(err) {
          return this.setState({loading:false, error:true, errNum:7, errorText:err});
        }
    }

    likedPost = () => {
        console.log('I like this post');
    }

    closeOverlayer = () => {
        return this.setState({overlay:false});
    }

    closeOverlayers = () => {
        return this.setState({submitSuccess:false});
    }

    closeCommentOverlayer = () => {
        return this.setState({commentOverlay:false});
    }

    showOverlay = () => {
        return this.setState({overlay:true});
    }
    showOverlayer = (id) => {
        return this.setState({overlay:true, portfolioItem:id});
    }

    reviewAccum = (arr) => {
        if(!arr) {
          return 0;
        }
        if(arr){
          // const sum = arr.map( el => parseInt(el.review) ).reduce((a, b) => a + b, 0);
          const sums = arr.reviews/arr.users;
          return sums;
        }
        return 0;
    }

    renderFlatlistHeader = () => {
        const { reviews, comment, portfolio, item } = this.state;
        return (
            <Block style={{paddingVertical:5,borderBottomWidth:StyleSheet.hairlineWidth, 
            borderColor:'#999999', backgroundColor:'white', paddingHorizontal: portfolio ? 5 : 0}}>
                <Block row space='between' style={{}}>
                    <Text style={{fontSize:19, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_END}}>
                        {reviews ? `Reviews: (${this.manageNumbers(this.props.reviewPost.totalReviews)})` : comment ? 'Comments' : portfolio ? item.creator.bizname!=='null' && item.creator.bizname ? `${item.creator.bizname} Portfolio`: `@${item.creator.displayName} Portfolio`: null}
                    </Text>
                    {
                        this.state.comment ?
                        <TouchableOpacity style={{paddingHorizontal:5}} onPress={this.showOverlay}>
                            <Block>
                                <Ionicons
                                    size={25}
                                    name={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
                                    color={argonTheme.COLORS.GRADIENT_END}
                                />
                            </Block>
                        </TouchableOpacity>: null
                    }
                </Block>
            </Block>
        )
    };

    emptyList = () => (
        <Block style={{justifyContent:'center', alignItems:'center'}}>
          <Text style={{fontFamily:'regular', color:argonTheme.COLORS.GRADIENT_END}}>No data found!</Text>
        </Block>
    );

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

    commentListing = ({item}) => (
        <ListItem
            leftAvatar={{ source: { uri: Odb.dbUrl+item.user.img[0] } }}
            title={item.user.displayName}
            titleStyle={{fontFamily:'bold', fontSize:15}}
            subtitle={item.text}
            subtitleStyle={{fontFamily:'regular', fontSize:12, color:'#999999'}}
            bottomDivider
        />
    );

    portfolioListing = ({item}) => (
        <Block style={{marginBottom: 4, backgroundColor:'white'}}>
            <PostItem item={item} iComment={()=>this.showOverlayer(item._id)} 
            iLiked={this.likedPost} iSave={() =>this.savePosting(item._id)} iComment={()=>this.showCommentOverlayer(item._id)} />
        </Block>
    );
    

  render() {
    const { commentText } = this.state;
    const { imageUrl, _id, category, creator, shortdesc, description, title, price, discount, button, review, regionLong, regionLat, link } = this.state.item;
    return (
        <Block flex style={styles.container}>
            <StatusBar hidden />
            <Animated.View style={this.position.getLayout()}>
            <StatusBar barStyle="light-content" />
            <Block style={styles.containerInside}>
                <Block flex= {this.state.hMoved ? 0.2 : 0.55} style={{backgroundColor:argonTheme.COLORS.BLACK, zIndex:10}}>
                    <FlatList
                        pagingEnabled={true}
                        style={{flex: 1, width:width}}
                        alwaysBounceHorizontal={true}
                        showsHorizontalScrollIndicator={false}
                        onEndReachedThreshold={0.1}
                        horizontal={true}
                        data={imageUrl}
                        keyExtractor={pp => pp}
                        renderItem={({item}) => (
                            <Image
                                PlaceholderContent={<ActivityIndicator color={argonTheme.COLORS.GRADIENT_END} />}
                                resizeMode='cover'
                                source={{ uri: Odb.dbUrl+item }}
                                style={{ width:width, height: Platform.OS==='android' ? 370 : 410 }}
                            />
                        )}
                    /> 
                    <Block style={{position:'absolute', width, height: 90, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 15000}}>
                        <Block row space='between' flex={0.5}>
                            <Block flex={!button || button==='null' ? 1 : 0.7} style={{justifyContent:'center'}}>
                                <Block flex={0.8} style={{paddingVertical:6}}>
                                    <Text numberOfLines={1} style={{fontFamily:'regular', fontSize:18, color:'white'}}>
                                        {title}
                                    </Text>
                                </Block>
                                <Block flex={0.2}>

                                </Block>
                            </Block>
                            {
                                !button || button==='null' ? null :
                                <Block flex={0.3}>
                                    <TouchableOpacity style={styles.button} onPress={this.postBtnPress}>
                                        <Block flex={1} style={{justifyContent:'center', alignItems:'center'}} >
                                            <Text style={{fontFamily:'regular', fontSize: 14, color:'white'}}>{button}</Text>
                                        </Block>
                                    </TouchableOpacity>
                                </Block>
                            }
                        </Block>
                        <Block row space='evenly' flex={0.5} style={{backgroundColor:'black'}}>
                            <TouchableOpacity onPress={()=> this.headerClickFunction('d')}>
                                <Block style={{marginTop:8, borderBottomWidth: this.state.details ? 2: 0, borderColor: argonTheme.COLORS.GRADIENT_END}}>
                                    <Text style={{fontFamily:'regular', fontSize: 12, color:'white', paddingVertical:2}}>DETAILS</Text>
                                </Block>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=> this.headerClickFunction('r')}>
                                <Block style={{marginTop:8, borderBottomWidth: this.state.reviews ? 2: 0, borderColor: argonTheme.COLORS.GRADIENT_END}}>
                                    <Text style={{fontFamily:'regular', fontSize: 12, color:'white', paddingVertical:2}}>REVIEWS</Text>
                                </Block>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=> this.headerClickFunction('cc')}>
                                <Block style={{marginTop:8, borderBottomWidth: this.state.comment ? 2: 0, borderColor: argonTheme.COLORS.GRADIENT_END}}>
                                    <Text style={{fontFamily:'regular', fontSize: 12, color:'white', paddingVertical:2}}>COMMENT</Text>
                                </Block>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=> this.headerClickFunction('p')}>
                                <Block style={{marginTop:8, borderBottomWidth: this.state.portfolio ? 2: 0, borderColor: argonTheme.COLORS.GRADIENT_END}}>
                                    <Text style={{fontFamily:'regular', fontSize: 12, color:'white', paddingVertical:2}}>PORTFOLIO</Text>
                                </Block>
                            </TouchableOpacity>
                        </Block>
                    </Block>
                </Block>
                <Block flex={this.state.hMoved ? 0.80:0.45} style={{backgroundColor:argonTheme.COLORS.GRADIENT_END}}>
                    {
                        !this.state.error ? null :
                        <Block row style={[styles.cardContainer, styles.shadow, {marginTop:2, height:30}]}>
                            <Block row flex={1} space='between'>
                                <Block style={{justifyContent:'center'}}>
                                    <Text style={{fontSize:15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_END}}>Error Found!</Text>
                                </Block>
                                <Block style={{justifyContent:'center'}}>
                                    <TouchableOpacity onPress={this.tryAgain} style={{backgroundColor:argonTheme.COLORS.PRIMARY}}>
                                        <Block style={{paddingVertical:5, paddingHorizontal: 10}}>
                                            <Text style={{fontFamily:'regular', fontSize: 12, color:'white'}}>Try Again</Text>
                                        </Block>
                                    </TouchableOpacity>
                                </Block>
                            </Block>
                        </Block>
                    }
                    {
                        this.state.details ?
                        <Block flex={1}>
                            <ScrollView
                                style={{flex:1}}
                                showsVerticalScrollIndicator={false}
                                decelerationRate={0}
                                scrollEventThrottle={16}>
                                    {
                                        !price || price==='null' ? null :
                                            <Block row style={[styles.cardContainer, styles.shadow, {marginTop:2, height:30}]}>
                                                <Block row flex={1} space='between'>
                                                    <Block style={{justifyContent:'center'}}>
                                                        <Text style={{fontSize:15, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_END}}>{
                                                            !price || price==='null' ? `Price: N/A`: `Price: $${price}`
                                                        }</Text>
                                                    </Block>
                                                    <Block style={{justifyContent:'center'}}>
                                                        <Text style={{fontSize:15, fontFamily:'regular', color:argonTheme.COLORS.SUCCESS}}>{
                                                            !discount || discount ==='null' ? null : `Save up to ${discount}%`
                                                        }</Text>
                                                    </Block>
                                                </Block>
                                            </Block>

                                    }
                                    <Block row style={[styles.cardContainer, styles.shadow, {marginTop:5}]}>
                                        <Block flex={0.75} style={{justifyContent:'center'}}>
                                            <Block>
                                                <Text style={{fontSize:15, fontFamily:'bold', color: argonTheme.COLORS.BLACK}}>Short Description</Text>
                                            </Block>
                                            <Block>
                                            <Text style={{fontSize:12, fontFamily:'regular', color: argonTheme.COLORS.BLACKS}}>{shortdesc}</Text>
                                            </Block>
                                        </Block>
                                        <Block flex={0.25} style={{justifyContent:'center', alignItems:'center'}}>
                                            <Block style={{justifyContent:'center', alignItems:'center'}}>
                                                <Text style={{fontSize:17, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_END}}>Ratings</Text>
                                            </Block>
                                            {
                                                !review || !review.reviews ?
                                                <Block style={{justifyContent:'center', alignItems:'center'}}>
                                                    <Text style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>N/A</Text>
                                                </Block> :
                                                <Block style={{justifyContent:'center', alignItems:'center'}}>
                                                    <Rating
                                                        type='star'
                                                        ratingColor='#6B24AA'
                                                        ratingCount={5}
                                                        imageSize = {15}
                                                        startingValue={this.reviewAccum(this.state.item.review)}
                                                        readonly
                                                    />
                                                </Block>
                                            }
                                        </Block>
                                    </Block>
                                    {
                                        !description || description==='null' ? null :
                                            <Block row style={[styles.cardContainer, styles.shadow, {marginTop:5, height:150}]}>
                                                <Block flex={1} style={{paddingVertical:5}}>
                                                    <Block>
                                                        <Text style={{fontSize:15, fontFamily:'bold', color: argonTheme.COLORS.BLACK}}>Other Description</Text>
                                                    </Block>
                                                    <Block>
                                                        <Text style={{fontSize:12, fontFamily:'regular', color: argonTheme.COLORS.BLACKS}}>{description}</Text>
                                                    </Block>
                                                </Block>
                                            </Block>
                                    }
                                    {
                                        !regionLat || regionLat ==='null' || !regionLong || regionLong ==='null' ? null :
                                        <Block row style={[styles.cardContainer, styles.shadow, {marginTop:5, height:150}]}>
                                            <MapView
                                                scrollEnabled={false}
                                                style={{ flex: 1 }}
                                                cacheEnabled={Platform.OS === 'android' ? true : false}
                                                initialRegion={{
                                                    longitude: parseInt(regionLong),
                                                    latitude: parseInt(regionLat),
                                                    longitudeDelta: 0.04,
                                                    latitudeDelta: 0.09
                                                }}>
                                                <Marker draggable={false}
                                                    coordinate={{
                                                        longitude: parseInt(regionLong),
                                                        latitude: parseInt(regionLat),
                                                        longitudeDelta: 0.04,
                                                        latitudeDelta: 0.09
                                                    }}/>
                                            </MapView> 
                                        </Block>
                                    }
                                    <Block row style={[styles.cardContainer, styles.shadow, {marginTop:5, marginBottom:!link || link === 'null' ?8:0}]}>
                                        <Block flex={0.75} style={{justifyContent:'center'}}>
                                            <Block row>
                                                <Block style={{marginRight: 10}}>
                                                    <Avatar
                                                        rounded
                                                        size='medium'
                                                        source={{
                                                            uri:
                                                            `${Odb.dbUrl}${creator.img}`,
                                                        }}
                                                    />
                                                </Block>
                                                <Block style={{justifyContent:'center'}}>
                                                    <Block>
                                                        <Text style={{fontSize:15, fontFamily:'bold', color: argonTheme.COLORS.BLACK}}>{creator.bizname ||creator.displayName}</Text>
                                                    </Block>
                                                    <Block>
                                                        <Text numberOfLines={1} style={{fontSize:12, fontFamily:'regular', color: argonTheme.COLORS.BLACKS}}>{creator.desc || 'No description avalable for this user'}</Text>
                                                    </Block>
                                                </Block>
                                            </Block>
                                        </Block>
                                        <Block flex={0.25} style={{justifyContent:'center', alignItems:'center'}}>
                                            <Block style={{justifyContent:'center', alignItems:'center'}}>
                                                <Text style={{fontSize:17, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_END}}>Contact</Text>
                                            </Block>
                                            <Block style={{justifyContent:'center', alignItems:'center'}}>
                                                <Text style={{fontFamily:'regular', fontSize:14, color: argonTheme.COLORS.BLACKS}}>{creator.phonenum ||'N/A'}</Text>
                                            </Block>
                                        </Block>
                                    </Block>
                                    {!link || link ==='null' ? null:
                                        <Block row style={[styles.cardContainer, styles.shadow, {marginTop:5, marginBottom:this.props.similarPost.data.length <= 0?10:1}]}>
                                            <Block style={{justifyContent:'center'}}>
                                                <Block style={{justifyContent:'center'}}>
                                                    <Block>
                                                        <Text style={{fontSize:12, fontFamily:'regular', color: argonTheme.COLORS.BLACKS}}>Business Website:</Text>
                                                    </Block>
                                                    <Block>
                                                        <Text numberOfLines={1} style={{fontSize:15, fontFamily:'bold', color: argonTheme.COLORS.GRADIENT_END}}>{link}</Text>
                                                    </Block>
                                                </Block>
                                            </Block>
                                        </Block>
                                    }
                                    {
                                        this.props.similarPost.data.length <= 0 ? null :
                                        <Block flex style={{...styles.cardContainer, marginTop:5, marginBottom:9, height:'auto', backgroundColor:'transparent'}}>
                                            <Block style={{justifyContent:'center', marginTop:5}}>
                                                <Text numberOfLines={1} style={{fontFamily:'bold', fontSize:20, color:'white'}}>
                                                    Similar Items
                                                </Text>
                                            </Block>
                                            <Block>
                                                <FlatList
                                                    // contentContainerStyle={{height: 'auto' }}
                                                    alwaysBounceHorizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    horizontal
                                                    ListEmptyComponent={<Block/>}
                                                    data={this.props.similarPost.data}
                                                    keyExtractor={pp => pp._id}
                                                    renderItem={({item}) =>
                                                        <Card item={item} shop horizontal style={{marginRight: 5}}/>
                                                    }
                                                /> 
                                            </Block>
                                        </Block>
                                    }
                            </ScrollView>
                        </Block> : null
                    }
                    {
                        this.state.reviews ?
                        <Block flex={1} style={{...styles.cardContainers, marginTop:2, }}>
                            <FlatList
                                ListHeaderComponent={this.renderFlatlistHeader()}
                                extraData={this.props.reviewPost}
                                data={this.props.reviewPost.data}
                                style={{flex: 1}}
                                ListEmptyComponent={<EmptyList x='No reviews for this item. Be the first to review!'/>}
                                showsVerticalScrollIndicator={false}
                                alwaysBounceVertical={true}
                                refreshControl={
                                <RefreshControl
                                    refreshing={this.state.loading}
                                    onRefresh={this.loadMorePost}
                                />
                                }
                                removeClippedSubviews
                                keyExtractor= {p => p._id}
                                renderItem = {this.reviewListing}
                            />
                        </Block> : null
                    }
                    {
                        this.state.comment ?
                        <Block flex={1} style={{...styles.cardContainers, marginTop:2, }}>
                            <FlatList
                                ListHeaderComponent={this.renderFlatlistHeader()}
                                ListEmptyComponent={this.emptyList}
                                refreshing={this.state.refreshing}
                                extraData={this.props.commentsPost}
                                data={this.props.commentsPost.data}
                                style={{flex: 1}}
                                showsVerticalScrollIndicator={false}
                                alwaysBounceVertical={true}
                                // data={this.state.reviewList}
                                onEndReachedThreshold={0.5}
                                onEndReached={this.loadMorePost}
                                removeClippedSubviews
                                keyExtractor= {p => p._id}
                                renderItem = {this.commentListing}
                            />
                        </Block> : null
                    }
                    {
                        this.state.portfolio ?
                        <Block flex={1} style={{...styles.cardContainers, marginTop:2, paddingHorizontal: 0, backgroundColor: 'transparent' }}>
                            <FlatList
                                ListHeaderComponent={this.renderFlatlistHeader()}
                                ListEmptyComponent={this.emptyList}
                                extraData={this.props.otherPost}
                                style={{flex: 1, width:width}}
                                contentContainerStyle={{width}}
                                showsVerticalScrollIndicator={false}
                                refreshing={this.state.loading}
                                onEndReachedThreshold={0.5}
                                onEndReached={this.loadMorePost}
                                removeClippedSubviews
                                data={this.props.otherPost.data}
                                keyExtractor= {p => p._id}
                                renderItem = {this.portfolioListing}
                            />
                        </Block> : null
                    }
                </Block>
            </Block>
            </Animated.View>
            {
                this.state.loading===true ? <Block center style={{ position:'absolute', bottom:height<=720?10:20, zIndex:1000 }}><Spinner color={argonTheme.COLORS.WHITE} label='Loading...' /></Block>:null
            }
            {
                this.state.overlay === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
                    <Overlayer medium btnPress={this.closeOverlayer}>
                        <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={HeaderHeight*4.2}>
                            <Block space='between' style={{padding:10, flex:0.9}} >
                                <TouchableOpacity style={{flex:1}} onPress={Keyboard.dismiss}>
                                    <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
                                        <Text style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>Comments</Text>
                                    </Block>
                                </TouchableOpacity>
                            </Block>
                            <Block row space='between' style={{borderWidth:1, borderColor: argonTheme.COLORS.GRADIENT_END, padding:15, borderRadius:20, marginHorizontal:10 }}>
                                <Block flex={0.8}>
                                    <FInput
                                        lcolor={argonTheme.COLORS.GRADIENT_START}
                                        lfont={18}
                                        label = 'Enter comment here...'
                                        small
                                        noBorder
                                        multiline
                                        value={this.state.commentText}
                                        onChangeText={text =>  this.setState({commentText:text})}
                                        autoCapitalize = "sentences"
                                        returnKeyType= {Platform.OS==='ios'?'next':'none'}
                                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START,height: !commentText ? 30 : !commentText.length > 30 ? 40 : commentText.length > 60 ? 55 : 80}}
                                    />
                                </Block>
                                <Block style={{height:'auto', alignItems:'center', justifyContent:'center'}} flex={0.2}>
                                    <TouchableOpacity style={{padding:5}} onPress={this.submitTextComment}>
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
            {
            this.state.submitSuccess === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
                <Overlayer smaller btnPress={this.closeOverlayers}>
                {
                    this.state.submissionType === 'comment' ?
                    <Block flex={1} middle style={{ marginTop:-20}}>
                        <Ionicons
                            style={{marginRight: 10}}
                            name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                            size={56}
                            color= {argonTheme.COLORS.SUCCESS}
                        />
                        <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Comment submitted!</Text>
                    </Block> :
                    <Block flex={1} middle style={{ marginTop:-25}}>
                    <Ionicons
                        style={{marginRight: 10}}
                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                        size={56}
                        color= {argonTheme.COLORS.SUCCESS}
                    />
                    <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Saved!</Text>
                    </Block>
                }
                </Overlayer></Block>
            }
            {
                this.state.commentOverlay === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
                    <Overlayer medium btnPress={this.closeCommentOverlayer}>
                        <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={Platform.OS==='ios'? HeaderHeight*4.2:HeaderHeight*3.6}>
                            <Block space='between' style={{padding:10, flex:1}} >
                                <Block style={{flex:0.95}} onPress={Keyboard.dismiss}>
                                    <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
                                        <Text style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>Comments</Text>
                                    </Block>
                                    <Block flex={1} style={{marginTop:2,}}>
                                        <FlatList
                                        ListEmptyComponent={this.emptyList}
                                        extraData={this.props.categoryPostComment}
                                        data={this.props.categoryPostComment.data}
                                        style={{flex: 1}}
                                        showsVerticalScrollIndicator={false}
                                        alwaysBounceVertical={true}
                                        refreshControl={
                                            <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={this.loadMoreComment}
                                            />
                                        }
                                        removeClippedSubviews
                                        keyExtractor= {p => p._id}
                                        renderItem = {this.commentListing}
                                        />
                                    </Block>
                                </Block>
                            </Block>
                            <Block row space='between' style={{borderWidth:1, borderColor: argonTheme.COLORS.GRADIENT_END, padding:15, borderRadius:20, marginHorizontal:10, zIndex:1000 }}>
                                <Block flex={0.8}>
                                    <FInput
                                        lcolor={argonTheme.COLORS.GRADIENT_START}
                                        lfont={18}
                                        label = 'Enter comment here...'
                                        small
                                        noBorder
                                        multiline
                                        value={this.state.commentText}
                                        onChangeText={text =>  this.setState({commentText:text})}
                                        autoCapitalize = "sentences"
                                        returnKeyType= {Platform.OS==='ios'?'next':'none'}
                                        style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START,height: !commentText ? 30 : !commentText.length > 30 ? 40 : commentText.length > 60 ? 55 : 80}}
                                    />
                                </Block>
                                <Block style={{height:'auto', alignItems:'center', justifyContent:'center'}} flex={0.2}>
                                    <TouchableOpacity style={{padding:5}} onPress={this.submitTextComment}>
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
  container: {
    backgroundColor: theme.COLORS.BLACK,
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
    flex: 1,
    position:'relative'
  },
  containerInside: {
    width: width,
    height: height - HeaderHeight,
  },
  button: {
    flex: 1,
    backgroundColor:argonTheme.COLORS.GRADIENT_END,
    alignItems:'center',
    justifyContent:'center',
    paddingVertical:3
  },
  buttons: {
    padding: 12,
  },
  cardContainer: {
    width:width,
    height: 60,
    paddingHorizontal: 5,
    backgroundColor:'white'
  },
  cardContainers: {
    width:width,
    flex: 1,
    paddingHorizontal: 5,
    backgroundColor:'white',
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});

const mapStateToProps = function(state) {
    return {
      storedView: state.dashboard.storedView,
      otherPost: state.dashboard.otherPost,
      similarPost: state.dashboard.similarPost,
      reviewPost: state.dashboard.postReview,
      commentsPost: state.dashboard.commentsPost,
      categoryPostComment: state.dashboard.categoryPostComment,
    }
}
export default connect(mapStateToProps,dash)(Product);